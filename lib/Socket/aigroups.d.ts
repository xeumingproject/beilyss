import type { GroupMetadata, ParticipantAction } from '../Types/index.js';
import type { BinaryNode } from '../WABinary/index.js';
import { makeGroupsSocket } from './groups.js';
export type AIGroupMetadata = GroupMetadata & {
    isAIGroup: true;
};
export declare const extractAIGroupMetadata: (result: BinaryNode) => AIGroupMetadata | undefined;
export declare const makeAIGroupsSocket: <T extends ReturnType<typeof makeGroupsSocket>>(sock: T) => T & {
    aiGroupMetadata: (jid: string) => Promise<AIGroupMetadata | undefined>;
    aiGroupCreate: (subject: string, participants?: string[], options?: {
        key?: string;
    }) => Promise<AIGroupMetadata | undefined>;
    aiGroupAddBot: (jid: string, botUser?: string) => Promise<{
        status: number;
        jid?: string;
        content?: BinaryNode["content"];
    }[]>;
    aiGroupLeave: (id: string) => Promise<undefined>;
    aiGroupParticipantsUpdate: (jid: string, participants: string[], action: ParticipantAction) => Promise<{
        status: number;
        jid?: string;
        content?: BinaryNode["content"];
    }[]>;
    aiGroupUpdateSubject: (jid: string, subject: string) => Promise<undefined>;
    aiGroupInviteCode: (jid: string) => Promise<string | undefined>;
    aiGroupRevokeInvite: (jid: string) => Promise<string | undefined>;
    aiGroupAcceptInvite: (code: string) => Promise<string | undefined>;
    aiGroupSettingUpdate: (jid: string, setting: string) => Promise<undefined>;
    aiGroupToggleEphemeral: (jid: string, ephemeralExpiration: number) => Promise<undefined>;
};
//# sourceMappingURL=aigroups.d.ts.map