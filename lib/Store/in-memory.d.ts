import type { AuthenticationState, BaileysEventEmitter, Chat, ConnectionState, Contact, GroupMetadata, PresenceData, WAMessage, WAMessageCursor } from '../Types/index.js';
export interface InMemoryStoreConfig {
    logger?: any;
}
export declare const makeInMemmoryStore: (config?: InMemoryStoreConfig) => {
    chats: Map<string, Chat>;
    contacts: {
        [jid: string]: Contact;
    };
    messages: {
        [jid: string]: WAMessage[];
    };
    groupMetadata: {
        [jid: string]: GroupMetadata;
    };
    presences: {
        [id: string]: {
            [participant: string]: PresenceData;
        };
    };
    state: Partial<ConnectionState>;
    bind: (ev: BaileysEventEmitter) => void;
    loadMessages: (jid: string, count?: number, cursor?: WAMessageCursor) => Promise<WAMessage[]>;
    loadMessage: (jid: string, id: string) => Promise<WAMessage | undefined>;
    mostRecentMessage: (jid: string) => Promise<WAMessage | undefined>;
    fetchImageUrl: (jid: string, sock?: any) => Promise<string | undefined>;
    fetchGroupMetadata: (jid: string, sock?: any) => Promise<GroupMetadata | undefined>;
    toJSON: () => {
        chats: Chat[];
        contacts: {
            [jid: string]: Contact;
        };
        messages: {
            [jid: string]: WAMessage[];
        };
        groupMetadata: {
            [jid: string]: GroupMetadata;
        };
        presences: {
            [id: string]: {
                [participant: string]: PresenceData;
            };
        };
        state: Partial<ConnectionState>;
    };
    fromJSON: (json: any) => void;
    writeToFile: (path: string) => Promise<void>;
    readFromFile: (path: string) => Promise<void>;
    writeToFileSync: (path: string) => void;
    readFromFileSync: (path: string) => void;
    clear: () => void;
};
export declare const makeInMemoryStore: (config?: InMemoryStoreConfig) => {
    chats: Map<string, Chat>;
    contacts: {
        [jid: string]: Contact;
    };
    messages: {
        [jid: string]: WAMessage[];
    };
    groupMetadata: {
        [jid: string]: GroupMetadata;
    };
    presences: {
        [id: string]: {
            [participant: string]: PresenceData;
        };
    };
    state: Partial<ConnectionState>;
    bind: (ev: BaileysEventEmitter) => void;
    loadMessages: (jid: string, count?: number, cursor?: WAMessageCursor) => Promise<WAMessage[]>;
    loadMessage: (jid: string, id: string) => Promise<WAMessage | undefined>;
    mostRecentMessage: (jid: string) => Promise<WAMessage | undefined>;
    fetchImageUrl: (jid: string, sock?: any) => Promise<string | undefined>;
    fetchGroupMetadata: (jid: string, sock?: any) => Promise<GroupMetadata | undefined>;
    toJSON: () => {
        chats: Chat[];
        contacts: {
            [jid: string]: Contact;
        };
        messages: {
            [jid: string]: WAMessage[];
        };
        groupMetadata: {
            [jid: string]: GroupMetadata;
        };
        presences: {
            [id: string]: {
                [participant: string]: PresenceData;
            };
        };
        state: Partial<ConnectionState>;
    };
    fromJSON: (json: any) => void;
    writeToFile: (path: string) => Promise<void>;
    readFromFile: (path: string) => Promise<void>;
    writeToFileSync: (path: string) => void;
    readFromFileSync: (path: string) => void;
    clear: () => void;
};
export declare const useJSONAuthState: (filePath: string) => Promise<{
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
}>;
//# sourceMappingURL=in-memory.d.ts.map