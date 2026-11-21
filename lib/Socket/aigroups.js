import { WAMessageAddressingMode } from '../Types/index.js';
import { generateMessageIDV2 } from '../Utils/index.js';
import { getBinaryNodeChild, getBinaryNodeChildren, jidEncode, jidNormalizedUser, S_WHATSAPP_NET } from '../WABinary/index.js';
import { makeGroupsSocket } from './groups.js';
export const extractAIGroupMetadata = (result) => {
    const group = getBinaryNodeChild(getBinaryNodeChild(result, 'create'), 'group') ?? getBinaryNodeChild(result, 'group');
    if (!group)
        return undefined;
    const groupId = group.attrs.id;
    const id = groupId.includes('@') ? groupId : jidEncode(groupId, 'g.us');
    const participants = getBinaryNodeChildren(group, 'participant').map(participant => {
        const participantId = participant.attrs.jid;
        const entry = {
            id: participantId,
            admin: participant.attrs.type ?? null
        };
        if (participant.attrs.phone_number)
            entry.phoneNumber = participant.attrs.phone_number;
        if (participant.attrs.lid)
            entry.lid = participant.attrs.lid;
        return entry;
    });
    const description = getBinaryNodeChild(group, 'description');
    const ephemeral = getBinaryNodeChild(group, 'ephemeral');
    return {
        id,
        subject: group.attrs.subject ?? '',
        subjectTime: group.attrs.s_t ? Number(group.attrs.s_t) : undefined,
        creation: group.attrs.creation ? Number(group.attrs.creation) : undefined,
        owner: group.attrs.creator ? jidNormalizedUser(group.attrs.creator) : undefined,
        ownerPn: group.attrs.creator_pn ? jidNormalizedUser(group.attrs.creator_pn) : undefined,
        owner_country_code: group.attrs.creator_country_code,
        size: group.attrs.size ? Number(group.attrs.size) : participants.length,
        addressingMode: group.attrs.addressing_mode === 'lid' ? WAMessageAddressingMode.LID : WAMessageAddressingMode.PN,
        desc: description?.attrs.body,
        descId: description?.attrs.id,
        descTime: description?.attrs.t ? Number(description.attrs.t) : undefined,
        descOwner: description?.attrs.participant ? jidNormalizedUser(description.attrs.participant) : undefined,
        descOwnerPn: description?.attrs.participant_pn ? jidNormalizedUser(description.attrs.participant_pn) : undefined,
        ephemeralDuration: ephemeral?.attrs.expiration ? Number(ephemeral.attrs.expiration) : undefined,
        participants,
        isAIGroup: true
    };
};
export const makeAIGroupsSocket = (sock) => {
    const aiGroupQuery = (jid, type, content) => sock.query({ tag: 'iq', attrs: { type, xmlns: 'w:g2', to: jid }, content });
    const aiGroupMetadata = async (jid) => extractAIGroupMetadata(await aiGroupQuery(jid, 'get', [{ tag: 'interactive', attrs: { request: 'interactive' } }]));
    const aiGroupCreate = async (subject, participants = [], options = {}) => {
        const result = await aiGroupQuery(S_WHATSAPP_NET, 'set', [
            {
                tag: 'create',
                attrs: { subject, key: options.key ?? generateMessageIDV2(sock.user?.id) },
                content: participants.map(jid => ({ tag: 'participant', attrs: { jid } }))
            }
        ]);
        return extractAIGroupMetadata(result);
    };
    const parseParticipants = (result) => getBinaryNodeChildren(result, 'participant').map(node => ({
        status: Number(node.attrs.error ?? node.attrs.code ?? 200),
        jid: node.attrs.jid,
        content: node.content
    }));
    const aiGroupAddBot = (jid, botUser = '867051314767696') => aiGroupQuery(jid, 'set', [
        { tag: 'add', attrs: {}, content: [{ tag: 'participant', attrs: { jid: `${botUser}@bot` } }] }
    ]).then(parseParticipants);
    const aiGroupLeave = (id) => aiGroupQuery(S_WHATSAPP_NET, 'set', [{ tag: 'leave', attrs: {}, content: [{ tag: 'group', attrs: { id } }] }]).then(() => undefined);
    const aiGroupParticipantsUpdate = (jid, participants, action) => aiGroupQuery(jid, 'set', [
        {
            tag: action,
            attrs: {},
            content: participants.map(participant => ({ tag: 'participant', attrs: { jid: participant } }))
        }
    ]).then(parseParticipants);
    const aiGroupUpdateSubject = (jid, subject) => aiGroupQuery(jid, 'set', [{ tag: 'subject', attrs: {}, content: Buffer.from(subject) }]).then(() => undefined);
    const aiGroupInviteCode = async (jid) => getBinaryNodeChild(await aiGroupQuery(jid, 'get', [{ tag: 'invite', attrs: {} }]), 'invite')?.attrs.code;
    const aiGroupRevokeInvite = aiGroupInviteCode;
    const aiGroupAcceptInvite = async (code) => getBinaryNodeChild(await aiGroupQuery(S_WHATSAPP_NET, 'set', [{ tag: 'invite', attrs: { code } }]), 'group')?.attrs
        .jid;
    const aiGroupSettingUpdate = (jid, setting) => aiGroupQuery(jid, 'set', [{ tag: setting, attrs: {} }]).then(() => undefined);
    const aiGroupToggleEphemeral = (jid, ephemeralExpiration) => aiGroupQuery(jid, 'set', ephemeralExpiration
        ? [{ tag: 'ephemeral', attrs: { expiration: String(ephemeralExpiration) } }]
        : [{ tag: 'not_ephemeral', attrs: {} }]).then(() => undefined);
    return {
        ...sock,
        aiGroupMetadata,
        aiGroupCreate,
        aiGroupAddBot,
        aiGroupLeave,
        aiGroupParticipantsUpdate,
        aiGroupUpdateSubject,
        aiGroupInviteCode,
        aiGroupRevokeInvite,
        aiGroupAcceptInvite,
        aiGroupSettingUpdate,
        aiGroupToggleEphemeral
    };
};
//# sourceMappingURL=aigroups.js.map