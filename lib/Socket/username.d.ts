import { USyncQuery } from '../WAUSync/index.js';
interface UsernameSocket {
    query: any;
    generateMessageTag: (...args: any[]) => string;
    executeUSyncQuery: (usync: USyncQuery) => Promise<any>;
    [key: string]: any;
}
export interface UsernameCheckResult {
    available: boolean;
    username: string;
    session_id: string;
    suggestions?: string[];
    rejectionReasons?: any[];
    suggestionsEligible?: boolean;
}
export interface SetUsernameOptions {
    source?: string;
    sessionId?: string;
    pin?: string;
}
export interface FindUserResult {
    jid: string;
    contact: boolean;
}
export declare const makeUsernameSocket: <T extends UsernameSocket>(sock: T) => T & {
    checkUsername: (username: string, includeSuggestions?: boolean, sessionId?: string) => Promise<UsernameCheckResult>;
    checkAndSetUsername: (username: string, includeSuggestions?: boolean) => Promise<any>;
    checkUsernameMulti: (usernames: string[]) => Promise<any>;
    setUsername: (username: string, options?: SetUsernameOptions) => Promise<any>;
    deleteUsername: () => Promise<any>;
    getMyUsername: () => Promise<string | null>;
    getUsernameRecommendations: (source?: string) => Promise<any>;
    setUsernamePin: (pin?: string | null) => Promise<any>;
    findUserByUsername: (username: string, pin?: string) => Promise<FindUserResult | null>;
    fetchContactUsernames: (...jids: string[]) => Promise<any>;
};
export {};
//# sourceMappingURL=username.d.ts.map