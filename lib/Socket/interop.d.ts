import type { BinaryNode } from '../WABinary/index.js';
export declare const INTEROP_MEX_QUERY_IDS: {
    readonly CREATE_GROUP: "25726817620301611";
    readonly LEAVE_GROUP: "25346167795013271";
    readonly ADD_PARTICIPANTS: "25732168276369451";
    readonly QUERY_GROUP_INFO: "32734144032867938";
    readonly PRIVACY_SETTINGS_QUERY: "24849123668112654";
    readonly PRIVACY_SETTINGS_UPDATE: "25421856497452763";
    readonly PRIVACY_SETTINGS_WITH_CONTACT_LIST: "24913399124998598";
};
export declare const INTEGRATOR_BIRDYCHAT = 12;
export declare const INTEGRATOR_HAIKET = 13;
type InteropSocket = {
    query: (node: BinaryNode) => Promise<BinaryNode>;
    generateMessageTag: () => string;
    logger: {
        info: (obj: object, msg: string) => void;
        warn: (obj: object, msg: string) => void;
    };
    signalRepository: {
        deleteSession: (jids: string[]) => Promise<void>;
    };
};
type InteropUser = {
    externalId: string;
    integratorId: number;
};
export declare const makeInteropSocket: <T extends InteropSocket>(sock: T) => T & {
    fetchIntegrators: () => Promise<{
        id: number;
        name: string | undefined;
        status: string | undefined;
        icon: string | undefined;
        identifierType: string | undefined;
        optedIn: boolean;
        features: {
            groupMessaging: boolean;
        };
    }[]>;
    acceptInteropTOS: () => Promise<void>;
    optInIntegrators: (ids?: number[]) => Promise<undefined>;
    optOutIntegrators: (ids?: number[]) => Promise<undefined>;
    resolveInteropUsers: (users: InteropUser[]) => Promise<({
        externalId: string | undefined;
        integratorId: number;
        error: {
            code: number;
            text: string | undefined;
        };
        jid?: undefined;
        normalizedExternalId?: undefined;
    } | {
        jid: string | undefined;
        externalId: string | undefined;
        normalizedExternalId: string | undefined;
        integratorId: number;
        error?: undefined;
    })[]>;
    resolveInteropUser: (externalId: string, integratorId: number) => Promise<{
        externalId: string | undefined;
        integratorId: number;
        error: {
            code: number;
            text: string | undefined;
        };
        jid?: undefined;
        normalizedExternalId?: undefined;
    } | {
        jid: string | undefined;
        externalId: string | undefined;
        normalizedExternalId: string | undefined;
        integratorId: number;
        error?: undefined;
    } | null>;
    getReachabilitySettings: () => Promise<{
        enabled: string | undefined;
        users: {
            externalId: string | undefined;
            integratorId: number;
            jid: string | undefined;
        }[];
    } | null>;
    setReachabilitySettings: (users: InteropUser[], enabled?: string) => Promise<undefined>;
    blockInteropUser: (jid: string) => Promise<undefined>;
    unblockInteropUser: (jid: string) => Promise<undefined>;
    reportInteropSpam: (jid: string, spamFlow?: string) => Promise<undefined>;
    trustInteropContact: (jid: string) => Promise<undefined>;
    initInterop: () => Promise<{
        id: number;
        name: string | undefined;
        status: string | undefined;
        icon: string | undefined;
        identifierType: string | undefined;
        optedIn: boolean;
        features: {
            groupMessaging: boolean;
        };
    }[]>;
    createInteropGroup: (participants: string[]) => Promise<unknown>;
    leaveInteropGroup: (jids: string | string[]) => Promise<unknown>;
    addParticipantsToInteropGroup: (groupJid: string, participants: string[]) => Promise<unknown>;
    queryInteropGroupInfo: (groupJid: string) => Promise<unknown>;
    queryInteropPrivacySettings: () => Promise<unknown>;
    updateInteropPrivacySetting: (feature: string, setting: string) => Promise<unknown>;
    updateInteropPrivacySettingWithContactList: (feature: string, setting: string, contacts: string[], contactListType: string, dhash?: string) => Promise<unknown>;
    getInteropGroupAddPrivacy: (jid: string, integratorId: number) => Promise<boolean>;
    INTEGRATOR_BIRDYCHAT: number;
    INTEGRATOR_HAIKET: number;
    INTEROP_MEX_QUERY_IDS: {
        readonly CREATE_GROUP: "25726817620301611";
        readonly LEAVE_GROUP: "25346167795013271";
        readonly ADD_PARTICIPANTS: "25732168276369451";
        readonly QUERY_GROUP_INFO: "32734144032867938";
        readonly PRIVACY_SETTINGS_QUERY: "24849123668112654";
        readonly PRIVACY_SETTINGS_UPDATE: "25421856497452763";
        readonly PRIVACY_SETTINGS_WITH_CONTACT_LIST: "24913399124998598";
    };
};
export {};
//# sourceMappingURL=interop.d.ts.map