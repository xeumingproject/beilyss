import type { AuthenticationState, BaileysEventEmitter, Chat, Contact, GroupMetadata, PresenceData, WAMessage, WAMessageCursor } from '../Types/index.js';
export interface SQLiteStoreConfig {
    location?: string;
}
export declare const useSQLiteAuthState: (locationOrDb: string | any) => {
    state: AuthenticationState;
    saveCreds: () => Promise<void>;
};
export declare const makeSQLiteStore: (config?: SQLiteStoreConfig) => {
    db: any;
    bind: (ev: BaileysEventEmitter) => void;
    loadMessages: (jid: string, count?: number, cursor?: WAMessageCursor) => Promise<WAMessage[]>;
    loadMessage: (jid: string, id: string) => Promise<WAMessage | undefined>;
    mostRecentMessage: (jid: string) => Promise<WAMessage | undefined>;
    getChat: (id: string) => Chat | undefined;
    getChats: () => Chat[];
    getContact: (id: string) => Contact | undefined;
    getContacts: () => Record<string, Contact>;
    getGroupMetadata: (id: string) => GroupMetadata | undefined;
    getPresence: (id: string) => Record<string, PresenceData> | undefined;
    useAuthState: () => {
        state: AuthenticationState;
        saveCreds: () => Promise<void>;
    };
    close: () => void;
    clear: () => void;
};
//# sourceMappingURL=sqlite.d.ts.map