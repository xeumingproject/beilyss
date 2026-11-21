import type { UserFacingSocketConfig } from '../Types/index.js';
declare const makeWASocket: (config: UserFacingSocketConfig) => {
    communityMetadata: (jid: string) => Promise<import("../index.js").GroupMetadata>;
    communityCreate: (subject: string, body: string) => Promise<import("../index.js").GroupMetadata | null>;
    communityCreateGroup: (subject: string, participants: string[], parentCommunityJid: string) => Promise<import("../index.js").GroupMetadata | null>;
    communityLeave: (id: string) => Promise<void>;
    communityUpdateSubject: (jid: string, subject: string) => Promise<void>;
    communityLinkGroup: (groupJid: string, parentCommunityJid: string) => Promise<void>;
    communityUnlinkGroup: (groupJid: string, parentCommunityJid: string) => Promise<void>;
    communityFetchLinkedGroups: (jid: string) => Promise<{
        communityJid: string;
        isCommunity: boolean;
        linkedGroups: {
            id: string | undefined;
            subject: string;
            creation: number | undefined;
            owner: string | undefined;
            size: number | undefined;
        }[];
    }>;
    communityRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    communityRequestParticipantsUpdate: (jid: string, participants: string[], action: "approve" | "reject") => Promise<{
        status: string;
        jid: string | undefined;
    }[]>;
    communityParticipantsUpdate: (jid: string, participants: string[], action: import("../index.js").ParticipantAction) => Promise<{
        status: string;
        jid: string | undefined;
        content: import("../index.js").BinaryNode;
    }[]>;
    communityUpdateDescription: (jid: string, description?: string) => Promise<void>;
    communityInviteCode: (jid: string) => Promise<string | undefined>;
    communityRevokeInvite: (jid: string) => Promise<string | undefined>;
    communityAcceptInvite: (code: string) => Promise<string | undefined>;
    communityRevokeInviteV4: (communityJid: string, invitedJid: string) => Promise<boolean>;
    communityAcceptInviteV4: (key: string | import("../index.js").WAMessageKey, inviteMessage: import("../index.js").proto.Message.IGroupInviteMessage) => Promise<any>;
    communityGetInviteInfo: (code: string) => Promise<import("../index.js").GroupMetadata>;
    communityToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    communitySettingUpdate: (jid: string, setting: "announcement" | "not_announcement" | "locked" | "unlocked") => Promise<void>;
    communityMemberAddMode: (jid: string, mode: "admin_add" | "all_member_add") => Promise<void>;
    communityJoinApprovalMode: (jid: string, mode: "on" | "off") => Promise<void>;
    communityFetchAllParticipating: () => Promise<{
        [_: string]: import("../index.js").GroupMetadata;
    }>;
    logger: import("../Utils/logger.js").ILogger;
    getOrderDetails: (orderId: string, tokenBase64: string) => Promise<import("../index.js").OrderDetails>;
    getCatalog: ({ jid, limit, cursor }: import("../index.js").GetCatalogOptions) => Promise<{
        products: import("../index.js").Product[];
        nextPageCursor: string | undefined;
    }>;
    getCollections: (jid?: string, limit?: number) => Promise<{
        collections: import("../index.js").CatalogCollection[];
    }>;
    productCreate: (create: import("../index.js").ProductCreate) => Promise<import("../index.js").Product>;
    productDelete: (productIds: string[]) => Promise<{
        deleted: number;
    }>;
    productUpdate: (productId: string, update: import("../index.js").ProductUpdate) => Promise<import("../index.js").Product>;
    updateBussinesProfile: (args: import("../Types/Bussines.js").UpdateBussinesProfileProps) => Promise<any>;
    updateCoverPhoto: (photo: import("../index.js").WAMediaUpload) => Promise<number>;
    removeCoverPhoto: (id: string) => Promise<any>;
    sendMessageAck: (node: import("../index.js").BinaryNode, errorCode?: number) => Promise<void>;
    sendRetryRequest: (node: import("../index.js").BinaryNode, forceIncludeKeys?: boolean) => Promise<void>;
    rejectCall: (callId: string, callFrom: string) => Promise<void>;
    fetchMessageHistory: (count: number, oldestMsgKey: import("../index.js").WAMessageKey, oldestMsgTimestamp: number | import("long").default) => Promise<string>;
    requestPlaceholderResend: (messageKey: import("../index.js").WAMessageKey, msgData?: Partial<import("../index.js").WAMessage>) => Promise<string | undefined>;
    messageRetryManager: import("../index.js").MessageRetryManager | null;
    userDevicesCache: import("../index.js").PossiblyExtendedCacheStore | import("@cacheable/node-cache").NodeCache<import("../index.js").JidWithDevice[]>;
    devicesMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    issuePrivacyTokens: (jids: string[], timestamp?: number) => Promise<any>;
    assertSessions: (jids: string[], force?: boolean) => Promise<boolean>;
    relayMessage: (jid: string, message: import("../index.js").proto.IMessage, { messageId: msgId, participant, additionalAttributes, additionalNodes, useUserDevicesCache, useCachedGroupMetadata, statusJidList, isSecret, isProtected: protectedSend }: import("../index.js").MessageRelayOptions) => Promise<string>;
    sendReceipt: (jid: string, participant: string | undefined, messageIds: string[], type: import("../index.js").MessageReceiptType) => Promise<void>;
    sendReceipts: (keys: import("../index.js").WAMessageKey[], type: import("../index.js").MessageReceiptType) => Promise<void>;
    readMessages: (keys: import("../index.js").WAMessageKey[]) => Promise<void>;
    refreshMediaConn: (forceGet?: boolean) => Promise<import("../index.js").MediaConnInfo>;
    getMediaHost: () => string;
    waUploadToServer: import("../index.js").WAMediaUploadFunction;
    fetchPrivacySettings: (force?: boolean) => Promise<{
        [_: string]: string;
    }>;
    sendPeerDataOperationMessage: (pdoMessage: import("../index.js").proto.Message.IPeerDataOperationRequestMessage) => Promise<string>;
    createParticipantNodes: (recipientJids: string[], message: import("../index.js").proto.IMessage, extraAttrs?: import("../index.js").BinaryNode["attrs"], dsmMessage?: import("../index.js").proto.IMessage) => Promise<{
        nodes: import("../index.js").BinaryNode[];
        shouldIncludeDeviceIdentity: boolean;
    }>;
    getUSyncDevices: (jids: string[], useCache: boolean, ignoreZeroDevices: boolean) => Promise<(import("../index.js").JidWithDevice & {
        jid: string;
    })[]>;
    updateMemberLabel: (jid: string, memberLabel: string) => Promise<string>;
    updateMediaMessage: (message: import("../index.js").WAMessage) => Promise<import("../index.js").WAMessage>;
    sendMessage: (jid: string, content: import("../index.js").AnyMessageContent, options?: import("../index.js").MiscMessageGenerationOptions) => Promise<import("../index.js").WAMessage | undefined>;
    sendFakeMessage: (jid: string, content: import("../index.js").AnyMessageContent, opts: {
        pn: string;
        lid: string;
        pushName: string;
    }) => Promise<boolean>;
    sendMessageMembers: (groupJid: string, content: import("../index.js").proto.IMessage, opts: any) => Promise<any>;
    sendRichMessage: (jid: string, opts: {
        unifiedResponse?: any;
        submessages?: any[];
        contextInfo?: any;
        originalRecipientMetadata?: any;
    }, relayOpts?: any) => Promise<string>;
    newsletterCreate: (name: string, description?: string) => Promise<import("../index.js").NewsletterMetadata>;
    newsletterUpdate: (jid: string, updates: import("../index.js").NewsletterUpdate) => Promise<unknown>;
    newsletterSubscribers: (jid: string) => Promise<{
        subscribers: number;
    }>;
    newsletterMetadata: (type: "invite" | "jid", key: string) => Promise<import("../index.js").NewsletterMetadata | null>;
    newsletterFollow: (jid: string) => Promise<unknown>;
    newsletterUnfollow: (jid: string) => Promise<unknown>;
    newsletterMute: (jid: string) => Promise<unknown>;
    newsletterUnmute: (jid: string) => Promise<unknown>;
    newsletterUpdateName: (jid: string, name: string) => Promise<unknown>;
    newsletterUpdateDescription: (jid: string, description: string) => Promise<unknown>;
    newsletterUpdatePicture: (jid: string, content: import("../index.js").WAMediaUpload) => Promise<unknown>;
    newsletterRemovePicture: (jid: string) => Promise<unknown>;
    newsletterReactMessage: (jid: string, serverId: string, reaction?: string) => Promise<void>;
    newsletterFetchMessages: (jid: string, count: number, since: number, after: number) => Promise<any>;
    subscribeNewsletterUpdates: (jid: string) => Promise<{
        duration: string;
    } | null>;
    newsletterAdminCount: (jid: string) => Promise<number>;
    newsletterChangeOwner: (jid: string, newOwnerJid: string) => Promise<void>;
    newsletterDemote: (jid: string, userJid: string) => Promise<void>;
    newsletterDelete: (jid: string) => Promise<void>;
    groupMetadata: (jid: string) => Promise<import("../index.js").GroupMetadata>;
    groupCreate: (subject: string, participants: string[]) => Promise<import("../index.js").GroupMetadata>;
    groupLeave: (id: string) => Promise<void>;
    groupUpdateSubject: (jid: string, subject: string) => Promise<void>;
    groupRequestParticipantsList: (jid: string) => Promise<{
        [key: string]: string;
    }[]>;
    groupRequestParticipantsUpdate: (jid: string, participants: string[], action: "approve" | "reject") => Promise<{
        status: string;
        jid: string | undefined;
    }[]>;
    groupParticipantsUpdate: (jid: string, participants: string[], action: import("../index.js").ParticipantAction) => Promise<{
        status: string;
        jid: string | undefined;
        content: import("../index.js").BinaryNode;
    }[]>;
    groupUpdateDescription: (jid: string, description?: string) => Promise<void>;
    groupInviteCode: (jid: string) => Promise<string | undefined>;
    groupRevokeInvite: (jid: string) => Promise<string | undefined>;
    groupAcceptInvite: (code: string) => Promise<string | undefined>;
    groupRevokeInviteV4: (groupJid: string, invitedJid: string) => Promise<boolean>;
    groupAcceptInviteV4: (key: string | import("../index.js").WAMessageKey, inviteMessage: import("../index.js").proto.Message.IGroupInviteMessage) => Promise<any>;
    groupGetInviteInfo: (code: string) => Promise<import("../index.js").GroupMetadata>;
    groupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<void>;
    groupSettingUpdate: (jid: string, setting: "announcement" | "not_announcement" | "locked" | "unlocked") => Promise<void>;
    groupMemberAddMode: (jid: string, mode: "admin_add" | "all_member_add") => Promise<void>;
    groupJoinApprovalMode: (jid: string, mode: "on" | "off") => Promise<void>;
    groupFetchAllParticipating: () => Promise<{
        [_: string]: import("../index.js").GroupMetadata;
    }>;
    serverProps: {
        privacyTokenOn1to1: boolean;
        profilePicPrivacyToken: boolean;
        lidTrustedTokenIssueToLid: boolean;
    };
    createCallLink: (type: "audio" | "video", event?: {
        startTime: number;
    }, timeoutMs?: number) => Promise<string | undefined>;
    getBotListV2: () => Promise<import("../index.js").BotListInfo[]>;
    messageMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    receiptMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    appStatePatchMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    notificationMutex: {
        mutex<T>(code: () => Promise<T> | T): Promise<T>;
    };
    upsertMessage: (msg: import("../index.js").WAMessage, type: import("../index.js").MessageUpsertType) => Promise<void>;
    appPatch: (patchCreate: import("../index.js").WAPatchCreate) => Promise<void>;
    sendPresenceUpdate: (type: import("../index.js").WAPresence, toJid?: string) => Promise<void>;
    presenceSubscribe: (toJid: string) => Promise<void>;
    profilePictureUrl: (jid: string, type?: "preview" | "image", timeoutMs?: number) => Promise<string | undefined>;
    fetchBlocklist: () => Promise<(string | undefined)[]>;
    fetchStatus: (...jids: string[]) => Promise<import("../index.js").USyncQueryResultList[] | undefined>;
    fetchDisappearingDuration: (...jids: string[]) => Promise<import("../index.js").USyncQueryResultList[] | undefined>;
    updateProfilePicture: (jid: string, content: import("../index.js").WAMediaUpload, dimensions?: {
        width: number;
        height: number;
    }) => Promise<void>;
    removeProfilePicture: (jid: string) => Promise<void>;
    updateProfileStatus: (status: string) => Promise<void>;
    updateProfileName: (name: string) => Promise<void>;
    updateBlockStatus: (jid: string, action: "block" | "unblock") => Promise<void>;
    setPrivacySetting: (name: string, value: string) => Promise<void>;
    setCallAddPrivacy: (value: import("../index.js").WAPrivacyCallValue) => Promise<void>;
    setLastSeenPrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    setOnlinePrivacy: (value: import("../index.js").WAPrivacyOnlineValue) => Promise<void>;
    setProfilePicturePrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    setStatusPrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    setReadReceiptsPrivacy: (value: import("../index.js").WAReadReceiptsValue) => Promise<void>;
    setGroupsAddPrivacy: (value: import("../index.js").WAPrivacyGroupAddValue) => Promise<void>;
    blockContact: (jid: string) => Promise<void>;
    unblockContact: (jid: string) => Promise<void>;
    updateDisableLinkPreviewsPrivacy: (isPreviewsDisabled: boolean) => Promise<void>;
    updateCallPrivacy: (value: import("../index.js").WAPrivacyCallValue) => Promise<void>;
    updateMessagesPrivacy: (value: import("../index.js").WAPrivacyMessagesValue) => Promise<void>;
    updateLastSeenPrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    updateOnlinePrivacy: (value: import("../index.js").WAPrivacyOnlineValue) => Promise<void>;
    updateProfilePicturePrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    updateStatusPrivacy: (value: import("../index.js").WAPrivacyValue) => Promise<void>;
    updateReadReceiptsPrivacy: (value: import("../index.js").WAReadReceiptsValue) => Promise<void>;
    updateGroupsAddPrivacy: (value: import("../index.js").WAPrivacyGroupAddValue) => Promise<void>;
    updateDefaultDisappearingMode: (duration: number) => Promise<void>;
    getBusinessProfile: (jid: string) => Promise<import("../index.js").WABusinessProfile | void>;
    resyncAppState: (collections: readonly ("critical_unblock_low" | "regular_high" | "regular_low" | "critical_block" | "regular")[], isInitialSync: boolean) => Promise<void>;
    chatModify: (mod: import("../index.js").ChatModification, jid: string) => Promise<void>;
    cleanDirtyBits: (type: "account_sync" | "groups", fromTimestamp?: number | string) => Promise<void>;
    reportSpam: (jid: string, options?: {
        flow?: string;
        source?: string;
        subject?: string;
        isKnownChat?: boolean;
    }) => Promise<{
        jid: string | undefined;
        flow: string;
        reported: boolean;
        node: any;
    }>;
    addOrEditContact: (jid: string, contact: import("../index.js").proto.SyncActionValue.IContactAction) => Promise<void>;
    removeContact: (jid: string) => Promise<void>;
    placeholderResendCache: import("../index.js").CacheStore;
    addLabel: (jid: string, labels: import("../Types/Label.js").LabelActionBody) => Promise<void>;
    addChatLabel: (jid: string, labelId: string) => Promise<void>;
    removeChatLabel: (jid: string, labelId: string) => Promise<void>;
    addMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    removeMessageLabel: (jid: string, messageId: string, labelId: string) => Promise<void>;
    star: (jid: string, messages: {
        id: string;
        fromMe?: boolean;
    }[], star: boolean) => Promise<void>;
    addOrEditQuickReply: (quickReply: import("../Types/Bussines.js").QuickReplyAction) => Promise<void>;
    removeQuickReply: (timestamp: string) => Promise<void>;
    type: "md";
    ws: import("./Client/index.js").WebSocketClient;
    ev: import("../index.js").BaileysEventEmitter & {
        process(handler: (events: Partial<import("../index.js").BaileysEventMap>) => void | Promise<void>): () => void;
        buffer(): void;
        createBufferedFunction<A extends any[], T>(work: (...args: A) => Promise<T>): (...args: A) => Promise<T>;
        flush(): boolean;
        isBuffering(): boolean;
        destroy(): void;
    };
    authState: {
        creds: import("../index.js").AuthenticationCreds;
        keys: import("../index.js").SignalKeyStoreWithTransaction;
    };
    signalRepository: import("../index.js").SignalRepositoryWithLIDStore;
    user: import("../index.js").Contact | undefined;
    generateMessageTag: () => string;
    query: (node: import("../index.js").BinaryNode, timeoutMs?: number) => Promise<any>;
    waitForMessage: <T>(msgId: string, timeoutMs?: number | undefined) => Promise<T | undefined>;
    waitForSocketOpen: () => Promise<void>;
    sendRawMessage: (data: Uint8Array | Buffer) => Promise<void>;
    sendNode: (frame: import("../index.js").BinaryNode) => Promise<void>;
    logout: (msg?: string) => Promise<void>;
    end: (error: Error | undefined) => Promise<void>;
    registerSocketEndHandler: (handler: (error: Error | undefined) => void | Promise<void>) => void;
    onUnexpectedError: (err: Error | import("@hapi/boom").Boom, msg: string) => void;
    uploadPreKeys: (count?: number) => Promise<void>;
    uploadPreKeysToServerIfRequired: () => Promise<void>;
    digestKeyBundle: () => Promise<void>;
    rotateSignedPreKey: () => Promise<void>;
    requestPairingCode: (phoneNumber: string, customPairingCode?: string) => Promise<string>;
    updateServerTimeOffset: ({ attrs }: import("../index.js").BinaryNode) => void;
    sendUnifiedSession: () => Promise<void>;
    wamBuffer: import("../index.js").BinaryInfo;
    waitForConnectionUpdate: (check: (u: Partial<import("../index.js").ConnectionState>) => Promise<boolean | undefined>, timeoutMs?: number) => Promise<void>;
    sendWAMBuffer: (wamBuffer: Buffer) => Promise<any>;
    executeUSyncQuery: (usyncQuery: import("../index.js").USyncQuery) => Promise<import("../index.js").USyncQueryResult | undefined>;
    onWhatsApp: (...phoneNumber: string[]) => Promise<{
        jid: string;
        exists: boolean;
    }[] | undefined>;
    fetchAccountReachoutTimelock: () => Promise<import("../index.js").ReachoutTimelockState>;
    fetchNewChatMessageCap: () => Promise<import("../index.js").NewChatMessageCapInfo>;
} & {
    aiGroupMetadata: (jid: string) => Promise<import("./aigroups.js").AIGroupMetadata | undefined>;
    aiGroupCreate: (subject: string, participants?: string[], options?: {
        key?: string;
    }) => Promise<import("./aigroups.js").AIGroupMetadata | undefined>;
    aiGroupAddBot: (jid: string, botUser?: string) => Promise<{
        status: number;
        jid?: string;
        content?: import("../index.js").BinaryNode["content"];
    }[]>;
    aiGroupLeave: (id: string) => Promise<undefined>;
    aiGroupParticipantsUpdate: (jid: string, participants: string[], action: import("../index.js").ParticipantAction) => Promise<{
        status: number;
        jid?: string;
        content?: import("../index.js").BinaryNode["content"];
    }[]>;
    aiGroupUpdateSubject: (jid: string, subject: string) => Promise<undefined>;
    aiGroupInviteCode: (jid: string) => Promise<string | undefined>;
    aiGroupRevokeInvite: (jid: string) => Promise<string | undefined>;
    aiGroupAcceptInvite: (code: string) => Promise<string | undefined>;
    aiGroupSettingUpdate: (jid: string, setting: string) => Promise<undefined>;
    aiGroupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<undefined>;
} & {
    checkUsername: (username: string, includeSuggestions?: boolean, sessionId?: string) => Promise<import("./username.js").UsernameCheckResult>;
    checkAndSetUsername: (username: string, includeSuggestions?: boolean) => Promise<any>;
    checkUsernameMulti: (usernames: string[]) => Promise<any>;
    setUsername: (username: string, options?: import("./username.js").SetUsernameOptions) => Promise<any>;
    deleteUsername: () => Promise<any>;
    getMyUsername: () => Promise<string | null>;
    getUsernameRecommendations: (source?: string) => Promise<any>;
    setUsernamePin: (pin?: string | null) => Promise<any>;
    findUserByUsername: (username: string, pin?: string) => Promise<import("./username.js").FindUserResult | null>;
    fetchContactUsernames: (...jids: string[]) => Promise<any>;
} & {
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
    resolveInteropUsers: (users: {
        externalId: string;
        integratorId: number;
    }[]) => Promise<({
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
    setReachabilitySettings: (users: {
        externalId: string;
        integratorId: number;
    }[], enabled?: string) => Promise<undefined>;
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
} & {
    hasPassword: () => Promise<unknown>;
    setPassword: (password: string, oldPassword?: string) => Promise<unknown>;
    checkPassword: (password: string) => Promise<unknown>;
    deletePassword: (password: string) => Promise<unknown>;
    passkeyExists: () => Promise<unknown>;
    passkeyListExists: () => Promise<unknown>;
    passkeyRequestChallenge: () => Promise<unknown>;
    passkeyVerifyChallenge: (credentialId: string, authenticatorData: string, clientDataJson: string, signature: string) => Promise<unknown>;
    passkeyDelete: (credentialId: string) => Promise<unknown>;
    regPasskeyStart: () => Promise<unknown>;
    regPasskeyFinish: (credentialId: string, attestationObject: string, clientDataJson: string) => Promise<unknown>;
    regPasskeyEnable: () => Promise<unknown>;
    regPasskeyDisable: () => Promise<unknown>;
    regPasskeyClear: () => Promise<unknown>;
    regPasskeyUpdateEncryptionStatus: (encryptionEnabled: boolean) => Promise<unknown>;
    getRegistrationUpsells: () => Promise<unknown>;
    getDynamicRegistrationUpsells: () => Promise<unknown>;
    registrationUpsellShown: (upsellId: string) => Promise<unknown>;
    registrationDynamicUpsellShown: (upsellId: string) => Promise<unknown>;
    regAccountTransferVerifyToken: (token: string) => Promise<unknown>;
    userCountryCodeGet: () => Promise<unknown>;
    suggestedContactsV2: (limit?: number) => Promise<unknown>;
    ageCollection: () => Promise<unknown>;
    getAgeExperience: () => Promise<unknown>;
    setAgeExperience: (birthYear: number, country?: string) => Promise<unknown>;
    submitAge: (birthYear: number, country?: string) => Promise<unknown>;
    getImagineMeOnboarded: () => Promise<unknown>;
    deleteImagineMeOnboarding: () => Promise<unknown>;
    fetchUserNoticesById: (noticeIds: string[]) => Promise<unknown>;
    createEnforcementAppeal: (reason: string, details?: string) => Promise<unknown>;
    getWaMeLink: () => Promise<unknown>;
    REGISTRATION_MEX_IDS: {
        readonly HAS_PASSWORD: "25379221318423478";
        readonly SET_PASSWORD: "33855141324134176";
        readonly CHECK_PASSWORD: "26881928138061632";
        readonly DELETE_PASSWORD: "27247058691550586";
        readonly PASSKEY_EXIST: "25188064727509430";
        readonly PASSKEY_LIST_EXIST: "26930537423220681";
        readonly PASSKEY_REQUEST_CHALLENGE: "26311497405176139";
        readonly PASSKEY_VERIFY_CHALLENGE: "26876394218624479";
        readonly PASSKEY_DELETE: "25225683640428243";
        readonly REG_PASSKEY_START: "25415371271434748";
        readonly REG_PASSKEY_FINISH: "24611221275218156";
        readonly REG_PASSKEY_ENABLE: "25147880151540247";
        readonly REG_PASSKEY_DISABLE: "27775237998742831";
        readonly REG_PASSKEY_CLEAR: "25111972538494859";
        readonly REG_PASSKEY_UPDATE_ENCRYPTION_STATUS: "24866837389649930";
        readonly GET_REGISTRATION_UPSELLS: "24265038133175291";
        readonly GET_DYNAMIC_REGISTRATION_UPSELLS: "32273353145641323";
        readonly REGISTRATION_UPSELL_SHOWN: "25896605016620945";
        readonly REGISTRATION_DYNAMIC_UPSELL_SHOWN: "25435755019399064";
        readonly REG_ACCOUNT_TRANSFER_VERIFY_TOKEN: "7580940708621318";
        readonly USER_COUNTRY_CODE: "25292528387076991";
        readonly SUGGESTED_CONTACTS_V2: "31663643799945793";
        readonly AGE_COLLECTION: "33502711132676934";
        readonly GET_AGE_EXPERIENCE: "26567868986241476";
        readonly SET_AGE_EXPERIENCE: "26051006311231325";
        readonly SUBMIT_AGE: "26049558371296621";
        readonly GET_IMAGINE_ME_ONBOARDED: "25082125671408942";
        readonly DELETE_IMAGINE_ME_ONBOARDING: "7106989772737677";
        readonly FETCH_USER_NOTICES: "32114003924880386";
        readonly CREATE_ENFORCEMENT_APPEAL: "26933630359642347";
        readonly GET_WA_ME_LINK: "25001183556215266";
    };
} & {
    managedAccountQuery: (jid: string) => Promise<unknown>;
    managedAccountInitiateLinking: (phoneNumber: string) => Promise<unknown>;
    managedAccountValidateLinking: (linkingToken: string, sponsorJid: string) => Promise<unknown>;
    managedAccountAcceptLinking: (linkingToken: string) => Promise<unknown>;
    managedAccountCompleteLinking: (linkingToken: string) => Promise<unknown>;
    managedAccountRevokeLinking: (sponsoredJid: string) => Promise<unknown>;
    managedAccountSyncActivities: (jid: string, lastSyncTime?: number) => Promise<unknown>;
    managedAccountUpdatePin: (oldPin: string, newPin: string) => Promise<unknown>;
    managedAccountGetSponsorAgeVerification: (sponsorJid: string) => Promise<unknown>;
    paymentsPasskeyHasCredential: () => Promise<unknown>;
    paymentsPasskeyEnrollChallenge: () => Promise<unknown>;
    paymentsPasskeyEnrollVerify: (credentialId: string, attestationObject: string, clientDataJson: string) => Promise<unknown>;
    paymentsPasskeyRegisterFinish: (credentialId: string, attestationObject: string, clientDataJson: string) => Promise<unknown>;
    paymentsPasskeyAuthChallenge: (credentialId: string) => Promise<unknown>;
    paymentsPasskeyToggleOn: () => Promise<unknown>;
    paymentsPasskeyToggleOff: () => Promise<unknown>;
    paymentsPasskeyToggleChallenge: (credentialId: string) => Promise<unknown>;
    paymentsPasskeyToggleCleanup: () => Promise<unknown>;
    paymentsPasskeyCleanup: () => Promise<unknown>;
    paymentsIsAccountRecoverable: () => Promise<unknown>;
    upiSendOtp: (phoneNumber: string) => Promise<unknown>;
    upiVerifyOtp: (phoneNumber: string, otp: string) => Promise<unknown>;
    iplsHandshakeInit: (payload: unknown) => Promise<unknown>;
    iplsClientHello: (payload: unknown) => Promise<unknown>;
    iplsdClientHelloV2: (payload: unknown) => Promise<unknown>;
    iplsdClientInitV2: (payload: unknown) => Promise<unknown>;
    MANAGED_ACCOUNT_MEX_IDS: {
        readonly QUERY: "27232244463035262";
        readonly INITIATE_LINKING: "26671873552498548";
        readonly VALIDATE_LINKING: "35449808311284430";
        readonly ACCEPT_LINKING: "26708926155457677";
        readonly COMPLETE_LINKING: "26866501363013203";
        readonly REVOKE_LINKING: "27435058196100677";
        readonly SYNC_ACTIVITIES: "26594352680227840";
        readonly UPDATE_PIN: "27653949584193082";
        readonly GET_SPONSOR_AGE_VERIFICATION: "26433623289634522";
        readonly PAYMENTS_PASSKEY_HAS_CREDENTIAL: "36878915648418618";
        readonly PAYMENTS_PASSKEY_ENROLL_CHALLENGE: "25233109079721001";
        readonly PAYMENTS_PASSKEY_ENROLL_VERIFY: "26563835863283058";
        readonly PAYMENTS_PASSKEY_REGISTER_FINISH: "26658791263822236";
        readonly PAYMENTS_PASSKEY_AUTH_CHALLENGE: "26425370627105628";
        readonly PAYMENTS_PASSKEY_TOGGLE_ON: "25841989828834577";
        readonly PAYMENTS_PASSKEY_TOGGLE_OFF: "26267673096201391";
        readonly PAYMENTS_PASSKEY_TOGGLE_CHALLENGE: "26133062322993192";
        readonly PAYMENTS_PASSKEY_TOGGLE_CLEANUP: "26492078607084840";
        readonly PAYMENTS_PASSKEY_CLEANUP: "26538338805859092";
        readonly PAYMENTS_IS_RECOVERABLE: "27351347491148282";
        readonly UPI_SEND_OTP: "25829794080022469";
        readonly UPI_VERIFY_OTP: "34104109149204669";
        readonly IPLS_HANDSHAKE_INIT: "25523747957257182";
        readonly IPLS_CLIENT_HELLO: "25376330595367716";
        readonly IPLSD_CLIENT_HELLO_V2: "26561780580105679";
        readonly IPLSD_CLIENT_INIT_V2: "26547193874915344";
    };
} & {
    executeWMexQuery: <T>(variables: {
        [x: string]: unknown;
    }, queryId: string, dataPath: string) => Promise<T>;
    executeWWWGraphQL: typeof import("./graphql.js").executeWWWGraphQL;
    executeFacebookGraphQL: typeof import("./graphql.js").executeFacebookGraphQL;
    executeWamoGraphQL: typeof import("./graphql.js").executeWamoGraphQL;
};
export default makeWASocket;
//# sourceMappingURL=index.d.ts.map