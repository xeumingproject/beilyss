import { existsSync, readFileSync, writeFileSync } from 'fs';
import { readFile, writeFile } from 'fs/promises';
import { proto } from '../../WAProto/index.js';
import { initAuthCreds } from '../Utils/auth-utils.js';
import { BufferJSON } from '../Utils/generics.js';
export const makeInMemmoryStore = (config) => {
    const logger = config?.logger;
    const chats = new Map();
    const contacts = {};
    const messages = {};
    const groupMetadata = {};
    const presences = {};
    const state = { connection: 'close' };
    const assertMessageList = (jid) => {
        if (!messages[jid]) {
            messages[jid] = [];
        }
        return messages[jid];
    };
    const loadMessages = async (jid, count = 25, cursor) => {
        const list = messages[jid] || [];
        const mode = cursor ? ('before' in cursor ? 'before' : 'after') : undefined;
        const cursorKey = cursor ? ('before' in cursor ? cursor.before : cursor.after) : undefined;
        if (!cursorKey) {
            return list.slice(-count);
        }
        const index = list.findIndex(m => m.key?.id === cursorKey.id);
        if (index === -1) {
            return [];
        }
        if (mode === 'before') {
            return list.slice(Math.max(0, index - count), index);
        }
        return list.slice(index + 1, index + 1 + count);
    };
    const loadMessage = async (jid, id) => {
        return messages[jid]?.find(m => m.key?.id === id);
    };
    const mostRecentMessage = async (jid) => {
        const list = messages[jid];
        return list?.length ? list[list.length - 1] : undefined;
    };
    const fetchImageUrl = async (jid, sock) => {
        const contact = contacts[jid];
        if (contact?.imgUrl) {
            return contact.imgUrl;
        }
        if (sock?.profilePictureUrl) {
            const url = await sock.profilePictureUrl(jid).catch(() => undefined);
            if (url && contact) {
                contact.imgUrl = url;
            }
            return url;
        }
    };
    const fetchGroupMetadata = async (jid, sock) => {
        if (groupMetadata[jid]) {
            return groupMetadata[jid];
        }
        if (sock?.groupMetadata) {
            const metadata = await sock.groupMetadata(jid).catch(() => undefined);
            if (metadata) {
                groupMetadata[jid] = metadata;
            }
            return metadata;
        }
    };
    const bind = (ev) => {
        logger?.debug?.('binding events to in-memory store');
        ev.on('connection.update', update => {
            Object.assign(state, update);
        });
        ev.on('messaging-history.set', ({ chats: newChats, contacts: newContacts, messages: newMessages }) => {
            for (const chat of newChats) {
                if (chat.id) {
                    const existing = chats.get(chat.id);
                    chats.set(chat.id, existing ? Object.assign(existing, chat) : chat);
                }
            }
            for (const contact of newContacts) {
                if (contact.id) {
                    contacts[contact.id] = Object.assign(contacts[contact.id] || {}, contact);
                }
            }
            for (const message of newMessages) {
                const jid = message.key?.remoteJid;
                if (jid) {
                    const list = assertMessageList(jid);
                    const exists = list.some(m => m.key?.id === message.key?.id);
                    if (!exists) {
                        list.push(message);
                    }
                }
            }
        });
        ev.on('chats.upsert', newChats => {
            for (const chat of newChats) {
                if (chat.id) {
                    const existing = chats.get(chat.id);
                    chats.set(chat.id, existing ? Object.assign(existing, chat) : chat);
                }
            }
        });
        ev.on('chats.update', updates => {
            for (const update of updates) {
                if (update.id) {
                    const chat = chats.get(update.id);
                    if (chat) {
                        Object.assign(chat, update);
                    }
                }
            }
        });
        ev.on('chats.delete', deletions => {
            for (const id of deletions) {
                chats.delete(id);
            }
        });
        ev.on('contacts.upsert', newContacts => {
            for (const contact of newContacts) {
                contacts[contact.id] = Object.assign(contacts[contact.id] || {}, contact);
            }
        });
        ev.on('contacts.update', updates => {
            for (const update of updates) {
                if (update.id && contacts[update.id]) {
                    Object.assign(contacts[update.id], update);
                }
            }
        });
        ev.on('messages.upsert', ({ messages: newMessages, type }) => {
            for (const message of newMessages) {
                const jid = message.key?.remoteJid;
                if (!jid)
                    continue;
                const list = assertMessageList(jid);
                const index = list.findIndex(m => m.key?.id === message.key?.id);
                if (index !== -1) {
                    list[index] = Object.assign(list[index], message);
                }
                else if (type === 'append') {
                    list.push(message);
                }
                else {
                    list.push(message);
                }
            }
        });
        ev.on('messages.update', updates => {
            for (const { key, update } of updates) {
                const jid = key?.remoteJid;
                if (!jid)
                    continue;
                const list = messages[jid];
                const msg = list?.find(m => m.key?.id === key?.id);
                if (msg) {
                    Object.assign(msg, update);
                }
            }
        });
        ev.on('messages.delete', item => {
            if ('all' in item && item.all) {
                delete messages[item.jid];
            }
            else if ('keys' in item) {
                for (const key of item.keys) {
                    const jid = key?.remoteJid;
                    if (jid && messages[jid]) {
                        messages[jid] = messages[jid].filter(m => m.key?.id !== key?.id);
                    }
                }
            }
        });
        ev.on('groups.upsert', groups => {
            for (const group of groups) {
                groupMetadata[group.id] = group;
            }
        });
        ev.on('groups.update', updates => {
            for (const update of updates) {
                if (update.id && groupMetadata[update.id]) {
                    Object.assign(groupMetadata[update.id], update);
                }
            }
        });
        ev.on('group-participants.update', ({ id, participants, action }) => {
            const metadata = groupMetadata[id];
            if (!metadata)
                return;
            switch (action) {
                case 'add':
                    metadata.participants.push(...participants);
                    break;
                case 'remove':
                    metadata.participants = metadata.participants.filter(p => !participants.some(r => r.id === p.id));
                    break;
                case 'demote':
                case 'promote':
                    for (const participant of metadata.participants) {
                        if (participants.some(p => p.id === participant.id)) {
                            participant.admin = action === 'promote' ? 'admin' : null;
                        }
                    }
                    break;
            }
        });
        ev.on('presence.update', ({ id, presences: p }) => {
            presences[id] = Object.assign(presences[id] || {}, p);
        });
    };
    const toJSON = () => {
        return {
            chats: Array.from(chats.values()),
            contacts,
            messages,
            groupMetadata,
            presences,
            state
        };
    };
    const fromJSON = (json) => {
        if (Array.isArray(json?.chats)) {
            chats.clear();
            for (const chat of json.chats) {
                chats.set(chat.id, chat);
            }
        }
        if (json?.contacts) {
            Object.assign(contacts, json.contacts);
        }
        if (json?.messages) {
            Object.assign(messages, json.messages);
        }
        if (json?.groupMetadata) {
            Object.assign(groupMetadata, json.groupMetadata);
        }
        if (json?.presences) {
            Object.assign(presences, json.presences);
        }
        if (json?.state) {
            Object.assign(state, json.state);
        }
    };
    const writeToFile = async (path) => {
        const json = JSON.stringify(toJSON(), BufferJSON.replacer);
        await writeFile(path, json, 'utf-8');
    };
    const readFromFile = async (path) => {
        if (existsSync(path)) {
            const raw = await readFile(path, 'utf-8');
            fromJSON(JSON.parse(raw, BufferJSON.reviver));
        }
    };
    const writeToFileSync = (path) => {
        const json = JSON.stringify(toJSON(), BufferJSON.replacer);
        writeFileSync(path, json, 'utf-8');
    };
    const readFromFileSync = (path) => {
        if (existsSync(path)) {
            const raw = readFileSync(path, 'utf-8');
            fromJSON(JSON.parse(raw, BufferJSON.reviver));
        }
    };
    const clear = () => {
        chats.clear();
        for (const key of Object.keys(contacts))
            delete contacts[key];
        for (const key of Object.keys(messages))
            delete messages[key];
        for (const key of Object.keys(groupMetadata))
            delete groupMetadata[key];
        for (const key of Object.keys(presences))
            delete presences[key];
    };
    return {
        chats,
        contacts,
        messages,
        groupMetadata,
        presences,
        state,
        bind,
        loadMessages,
        loadMessage,
        mostRecentMessage,
        fetchImageUrl,
        fetchGroupMetadata,
        toJSON,
        fromJSON,
        writeToFile,
        readFromFile,
        writeToFileSync,
        readFromFileSync,
        clear
    };
};
export const makeInMemoryStore = makeInMemmoryStore;
export const useJSONAuthState = async (filePath) => {
    let creds = initAuthCreds();
    const keysStore = {};
    if (existsSync(filePath)) {
        try {
            const raw = await readFile(filePath, 'utf-8');
            const parsed = JSON.parse(raw, BufferJSON.reviver);
            if (parsed?.creds) {
                creds = parsed.creds;
            }
            if (parsed?.keys) {
                Object.assign(keysStore, parsed.keys);
            }
        }
        catch { }
    }
    const saveCreds = async () => {
        const payload = {
            creds,
            keys: keysStore
        };
        const raw = JSON.stringify(payload, BufferJSON.replacer);
        await writeFile(filePath, raw, 'utf-8');
    };
    const state = {
        creds,
        keys: {
            get: async (type, ids) => {
                const data = {};
                const category = keysStore[type] || {};
                for (const id of ids) {
                    let value = category[id];
                    if (type === 'app-state-sync-key' && value) {
                        value = proto.Message.AppStateSyncKeyData.fromObject(value);
                    }
                    data[id] = value;
                }
                return data;
            },
            set: async (data) => {
                for (const category in data) {
                    if (!keysStore[category]) {
                        keysStore[category] = {};
                    }
                    for (const id in data[category]) {
                        const value = data[category][id];
                        if (value) {
                            keysStore[category][id] = value;
                        }
                        else {
                            delete keysStore[category][id];
                        }
                    }
                }
                await saveCreds();
            }
        }
    };
    return {
        state,
        saveCreds
    };
};
//# sourceMappingURL=in-memory.js.map