import { proto } from '../../WAProto/index.js'
import type {
	AuthenticationCreds,
	AuthenticationState,
	BaileysEventEmitter,
	Chat,
	Contact,
	GroupMetadata,
	PresenceData,
	SignalDataTypeMap,
	WAMessage,
	WAMessageCursor
} from '../Types'
import { initAuthCreds } from '../Utils/auth-utils'
import { BufferJSON } from '../Utils/generics'

let cachedDatabaseSync: any
const getDatabaseSync = () => {
	if (!cachedDatabaseSync) {
		try {
			cachedDatabaseSync = require('node:sqlite').DatabaseSync
		} catch {
			throw new Error('node:sqlite is not available in this Node.js version')
		}
	}

	return cachedDatabaseSync
}

export interface SQLiteStoreConfig {
	location?: string
}

export const useSQLiteAuthState = (
	locationOrDb: string | any
): { state: AuthenticationState; saveCreds: () => Promise<void> } => {
	const DatabaseSync = getDatabaseSync()
	const db = typeof locationOrDb === 'string' ? new DatabaseSync(locationOrDb) : locationOrDb

	db.exec(`
		CREATE TABLE IF NOT EXISTS auth_creds (
			id TEXT PRIMARY KEY,
			data TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS auth_keys (
			type TEXT NOT NULL,
			id TEXT NOT NULL,
			data TEXT NOT NULL,
			PRIMARY KEY (type, id)
		);
	`)

	const selectCreds = db.prepare('SELECT data FROM auth_creds WHERE id = ?')
	const upsertCreds = db.prepare('INSERT OR REPLACE INTO auth_creds (id, data) VALUES (?, ?)')
	const selectKey = db.prepare('SELECT data FROM auth_keys WHERE type = ? AND id = ?')
	const upsertKey = db.prepare('INSERT OR REPLACE INTO auth_keys (type, id, data) VALUES (?, ?, ?)')
	const deleteKey = db.prepare('DELETE FROM auth_keys WHERE type = ? AND id = ?')

	let creds: AuthenticationCreds
	const row = selectCreds.get('creds') as { data: string } | undefined

	if (row?.data) {
		creds = JSON.parse(row.data, BufferJSON.reviver)
	} else {
		creds = initAuthCreds()
		upsertCreds.run('creds', JSON.stringify(creds, BufferJSON.replacer))
	}

	const saveCreds = async () => {
		upsertCreds.run('creds', JSON.stringify(creds, BufferJSON.replacer))
	}

	const state: AuthenticationState = {
		creds,
		keys: {
			get: async (type, ids) => {
				const data: { [_: string]: SignalDataTypeMap[typeof type] } = {}
				for (const id of ids) {
					const r = selectKey.get(type, id) as { data: string } | undefined
					if (r?.data) {
						let value = JSON.parse(r.data, BufferJSON.reviver)
						if (type === 'app-state-sync-key') {
							value = proto.Message.AppStateSyncKeyData.fromObject(value)
						}

						data[id] = value
					}
				}

				return data
			},
			set: async items => {
				db.exec('BEGIN TRANSACTION')
				try {
					for (const type in items) {
						for (const id in items[type as keyof SignalDataTypeMap]) {
							const value = items[type as keyof SignalDataTypeMap]![id]
							if (value) {
								const serialized = JSON.stringify(value, BufferJSON.replacer)
								upsertKey.run(type, id, serialized)
							} else {
								deleteKey.run(type, id)
							}
						}
					}

					db.exec('COMMIT')
				} catch (err) {
					db.exec('ROLLBACK')
					throw err
				}
			}
		}
	}

	return {
		state,
		saveCreds
	}
}

export const makeSQLiteStore = (config?: SQLiteStoreConfig) => {
	const DatabaseSync = getDatabaseSync()
	const location = config?.location || ':memory:'
	const db = new DatabaseSync(location)

	db.exec(`
		CREATE TABLE IF NOT EXISTS chats (
			id TEXT PRIMARY KEY,
			data TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS contacts (
			id TEXT PRIMARY KEY,
			data TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS messages (
			id TEXT NOT NULL,
			jid TEXT NOT NULL,
			timestamp INTEGER NOT NULL,
			data TEXT NOT NULL,
			PRIMARY KEY (jid, id)
		);
		CREATE INDEX IF NOT EXISTS idx_messages_jid ON messages (jid, timestamp);
		CREATE TABLE IF NOT EXISTS group_metadata (
			id TEXT PRIMARY KEY,
			data TEXT NOT NULL
		);
		CREATE TABLE IF NOT EXISTS presences (
			id TEXT PRIMARY KEY,
			data TEXT NOT NULL
		);
	`)

	const upsertChatStmt = db.prepare('INSERT OR REPLACE INTO chats (id, data) VALUES (?, ?)')
	const deleteChatStmt = db.prepare('DELETE FROM chats WHERE id = ?')
	const selectChatStmt = db.prepare('SELECT data FROM chats WHERE id = ?')
	const selectAllChatsStmt = db.prepare('SELECT data FROM chats')

	const upsertContactStmt = db.prepare('INSERT OR REPLACE INTO contacts (id, data) VALUES (?, ?)')
	const selectContactStmt = db.prepare('SELECT data FROM contacts WHERE id = ?')
	const selectAllContactsStmt = db.prepare('SELECT id, data FROM contacts')

	const upsertMessageStmt = db.prepare('INSERT OR REPLACE INTO messages (id, jid, timestamp, data) VALUES (?, ?, ?, ?)')
	const selectMessageStmt = db.prepare('SELECT data FROM messages WHERE jid = ? AND id = ?')
	const selectMessagesBeforeStmt = db.prepare(
		'SELECT data FROM messages WHERE jid = ? AND timestamp < ? ORDER BY timestamp DESC LIMIT ?'
	)
	const selectMessagesAfterStmt = db.prepare(
		'SELECT data FROM messages WHERE jid = ? AND timestamp > ? ORDER BY timestamp ASC LIMIT ?'
	)
	const selectLatestMessagesStmt = db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY timestamp DESC LIMIT ?')
	const selectMostRecentStmt = db.prepare('SELECT data FROM messages WHERE jid = ? ORDER BY timestamp DESC LIMIT 1')
	const deleteMessageStmt = db.prepare('DELETE FROM messages WHERE jid = ? AND id = ?')
	const deleteAllMessagesStmt = db.prepare('DELETE FROM messages WHERE jid = ?')

	const upsertGroupStmt = db.prepare('INSERT OR REPLACE INTO group_metadata (id, data) VALUES (?, ?)')
	const selectGroupStmt = db.prepare('SELECT data FROM group_metadata WHERE id = ?')

	const upsertPresenceStmt = db.prepare('INSERT OR REPLACE INTO presences (id, data) VALUES (?, ?)')
	const selectPresenceStmt = db.prepare('SELECT data FROM presences WHERE id = ?')

	const getChat = (id: string): Chat | undefined => {
		const row = selectChatStmt.get(id) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const getChats = (): Chat[] => {
		const rows = selectAllChatsStmt.all() as { data: string }[]
		return rows.map(r => JSON.parse(r.data, BufferJSON.reviver))
	}

	const getContact = (id: string): Contact | undefined => {
		const row = selectContactStmt.get(id) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const getContacts = (): Record<string, Contact> => {
		const rows = selectAllContactsStmt.all() as { id: string; data: string }[]
		const result: Record<string, Contact> = {}
		for (const row of rows) {
			result[row.id] = JSON.parse(row.data, BufferJSON.reviver)
		}

		return result
	}

	const getGroupMetadata = (id: string): GroupMetadata | undefined => {
		const row = selectGroupStmt.get(id) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const getPresence = (id: string): Record<string, PresenceData> | undefined => {
		const row = selectPresenceStmt.get(id) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const loadMessage = async (jid: string, id: string): Promise<WAMessage | undefined> => {
		const row = selectMessageStmt.get(jid, id) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const mostRecentMessage = async (jid: string): Promise<WAMessage | undefined> => {
		const row = selectMostRecentStmt.get(jid) as { data: string } | undefined
		return row ? JSON.parse(row.data, BufferJSON.reviver) : undefined
	}

	const loadMessages = async (jid: string, count = 25, cursor?: WAMessageCursor): Promise<WAMessage[]> => {
		if (!cursor) {
			const rows = selectLatestMessagesStmt.all(jid, count) as { data: string }[]
			return rows.map(r => JSON.parse(r.data, BufferJSON.reviver)).reverse()
		}

		const mode = 'before' in cursor ? 'before' : 'after'
		const cursorKey = 'before' in cursor ? cursor.before : cursor.after

		if (!cursorKey?.id) {
			const rows = selectLatestMessagesStmt.all(jid, count) as { data: string }[]
			return rows.map(r => JSON.parse(r.data, BufferJSON.reviver)).reverse()
		}

		const anchor = await loadMessage(jid, cursorKey.id)
		const anchorTime = Number(anchor?.messageTimestamp || 0)

		if (mode === 'before') {
			const rows = selectMessagesBeforeStmt.all(jid, anchorTime, count) as { data: string }[]
			return rows.map(r => JSON.parse(r.data, BufferJSON.reviver)).reverse()
		}

		const rows = selectMessagesAfterStmt.all(jid, anchorTime, count) as { data: string }[]
		return rows.map(r => JSON.parse(r.data, BufferJSON.reviver))
	}

	const bind = (ev: BaileysEventEmitter) => {
		ev.on('messaging-history.set', ({ chats: newChats, contacts: newContacts, messages: newMessages }) => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const chat of newChats) {
					if (chat.id) {
						const existing = getChat(chat.id)
						const merged = existing ? Object.assign(existing, chat) : chat
						upsertChatStmt.run(chat.id, JSON.stringify(merged, BufferJSON.replacer))
					}
				}

				for (const contact of newContacts) {
					if (contact.id) {
						const existing = getContact(contact.id)
						const merged = existing ? Object.assign(existing, contact) : contact
						upsertContactStmt.run(contact.id, JSON.stringify(merged, BufferJSON.replacer))
					}
				}

				for (const message of newMessages) {
					const jid = message.key?.remoteJid
					const id = message.key?.id
					if (jid && id) {
						const ts = Number(message.messageTimestamp || Date.now() / 1000)
						upsertMessageStmt.run(id, jid, ts, JSON.stringify(message, BufferJSON.replacer))
					}
				}

				db.exec('COMMIT')
			} catch (e) {
				db.exec('ROLLBACK')
			}
		})

		ev.on('chats.upsert', newChats => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const chat of newChats) {
					if (chat.id) {
						const existing = getChat(chat.id)
						const merged = existing ? Object.assign(existing, chat) : chat
						upsertChatStmt.run(chat.id, JSON.stringify(merged, BufferJSON.replacer))
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('chats.update', updates => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const update of updates) {
					if (update.id) {
						const existing = getChat(update.id)
						if (existing) {
							const merged = Object.assign(existing, update)
							upsertChatStmt.run(update.id, JSON.stringify(merged, BufferJSON.replacer))
						}
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('chats.delete', deletions => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const id of deletions) {
					deleteChatStmt.run(id)
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('contacts.upsert', newContacts => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const contact of newContacts) {
					const existing = getContact(contact.id)
					const merged = existing ? Object.assign(existing, contact) : contact
					upsertContactStmt.run(contact.id, JSON.stringify(merged, BufferJSON.replacer))
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('contacts.update', updates => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const update of updates) {
					if (update.id) {
						const existing = getContact(update.id)
						if (existing) {
							const merged = Object.assign(existing, update)
							upsertContactStmt.run(update.id, JSON.stringify(merged, BufferJSON.replacer))
						}
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('messages.upsert', ({ messages: newMessages }) => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const message of newMessages) {
					const jid = message.key?.remoteJid
					const id = message.key?.id
					if (jid && id) {
						const ts = Number(message.messageTimestamp || Date.now() / 1000)
						upsertMessageStmt.run(id, jid, ts, JSON.stringify(message, BufferJSON.replacer))
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('messages.update', updates => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const { key, update } of updates) {
					const jid = key?.remoteJid
					const id = key?.id
					if (jid && id) {
						const row = selectMessageStmt.get(jid, id) as { data: string } | undefined
						if (row) {
							const msg = JSON.parse(row.data, BufferJSON.reviver)
							const merged = Object.assign(msg, update)
							const ts = Number(merged.messageTimestamp || Date.now() / 1000)
							upsertMessageStmt.run(id, jid, ts, JSON.stringify(merged, BufferJSON.replacer))
						}
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('messages.delete', item => {
			if ('all' in item && item.all) {
				deleteAllMessagesStmt.run(item.jid)
			} else if ('keys' in item) {
				db.exec('BEGIN TRANSACTION')
				try {
					for (const key of item.keys) {
						if (key?.remoteJid && key?.id) {
							deleteMessageStmt.run(key.remoteJid, key.id)
						}
					}

					db.exec('COMMIT')
				} catch {
					db.exec('ROLLBACK')
				}
			}
		})

		ev.on('groups.upsert', groups => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const group of groups) {
					upsertGroupStmt.run(group.id, JSON.stringify(group, BufferJSON.replacer))
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('groups.update', updates => {
			db.exec('BEGIN TRANSACTION')
			try {
				for (const update of updates) {
					if (update.id) {
						const existing = getGroupMetadata(update.id)
						if (existing) {
							const merged = Object.assign(existing, update)
							upsertGroupStmt.run(update.id, JSON.stringify(merged, BufferJSON.replacer))
						}
					}
				}

				db.exec('COMMIT')
			} catch {
				db.exec('ROLLBACK')
			}
		})

		ev.on('presence.update', ({ id, presences: p }) => {
			const existing = getPresence(id) || {}
			const merged = Object.assign(existing, p)
			upsertPresenceStmt.run(id, JSON.stringify(merged, BufferJSON.replacer))
		})
	}

	const useAuthState = () => {
		return useSQLiteAuthState(db)
	}

	const close = () => {
		db.close()
	}

	const clear = () => {
		db.exec(`
			DELETE FROM chats;
			DELETE FROM contacts;
			DELETE FROM messages;
			DELETE FROM group_metadata;
			DELETE FROM presences;
		`)
	}

	return {
		db,
		bind,
		loadMessages,
		loadMessage,
		mostRecentMessage,
		getChat,
		getChats,
		getContact,
		getContacts,
		getGroupMetadata,
		getPresence,
		useAuthState,
		close,
		clear
	}
}
