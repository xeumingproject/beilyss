import type { GroupMetadata, GroupParticipant, ParticipantAction } from '../Types'
import { WAMessageAddressingMode } from '../Types'
import { generateMessageIDV2 } from '../Utils'
import type { BinaryNode } from '../WABinary'
import { getBinaryNodeChild, getBinaryNodeChildren, jidEncode, jidNormalizedUser, S_WHATSAPP_NET } from '../WABinary'
import { makeGroupsSocket } from './groups'

export type AIGroupMetadata = GroupMetadata & { isAIGroup: true }

export const extractAIGroupMetadata = (result: BinaryNode): AIGroupMetadata | undefined => {
	const group = getBinaryNodeChild(getBinaryNodeChild(result, 'create'), 'group') ?? getBinaryNodeChild(result, 'group')
	if (!group) return undefined
	const groupId = group.attrs.id!
	const id = groupId.includes('@') ? groupId : jidEncode(groupId, 'g.us')
	const participants = getBinaryNodeChildren(group, 'participant').map(participant => {
		const participantId = participant.attrs.jid!
		const entry: GroupParticipant = {
			id: participantId,
			admin: (participant.attrs.type as GroupParticipant['admin']) ?? null
		}
		if (participant.attrs.phone_number) entry.phoneNumber = participant.attrs.phone_number
		if (participant.attrs.lid) entry.lid = participant.attrs.lid
		return entry
	})
	const description = getBinaryNodeChild(group, 'description')
	const ephemeral = getBinaryNodeChild(group, 'ephemeral')
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
	}
}

export const makeAIGroupsSocket = <T extends ReturnType<typeof makeGroupsSocket>>(sock: T) => {
	const aiGroupQuery = (jid: string, type: 'get' | 'set', content: BinaryNode[]) =>
		sock.query({ tag: 'iq', attrs: { type, xmlns: 'w:g2', to: jid }, content })
	const aiGroupMetadata = async (jid: string) =>
		extractAIGroupMetadata(await aiGroupQuery(jid, 'get', [{ tag: 'interactive', attrs: { request: 'interactive' } }]))
	const aiGroupCreate = async (subject: string, participants: string[] = [], options: { key?: string } = {}) => {
		const result = await aiGroupQuery(S_WHATSAPP_NET, 'set', [
			{
				tag: 'create',
				attrs: { subject, key: options.key ?? generateMessageIDV2(sock.user?.id) },
				content: participants.map(jid => ({ tag: 'participant', attrs: { jid } }))
			}
		])
		return extractAIGroupMetadata(result)
	}

	const parseParticipants = (
		result: BinaryNode
	): Array<{ status: number; jid?: string; content?: BinaryNode['content'] }> =>
		getBinaryNodeChildren(result, 'participant').map(node => ({
			status: Number(node.attrs.error ?? node.attrs.code ?? 200),
			jid: node.attrs.jid,
			content: node.content
		}))
	const aiGroupAddBot = (jid: string, botUser = '867051314767696') =>
		aiGroupQuery(jid, 'set', [
			{ tag: 'add', attrs: {}, content: [{ tag: 'participant', attrs: { jid: `${botUser}@bot` } }] }
		]).then(parseParticipants)
	const aiGroupLeave = (id: string) =>
		aiGroupQuery(S_WHATSAPP_NET, 'set', [{ tag: 'leave', attrs: {}, content: [{ tag: 'group', attrs: { id } }] }]).then(
			() => undefined
		)
	const aiGroupParticipantsUpdate = (jid: string, participants: string[], action: ParticipantAction) =>
		aiGroupQuery(jid, 'set', [
			{
				tag: action,
				attrs: {},
				content: participants.map(participant => ({ tag: 'participant', attrs: { jid: participant } }))
			}
		]).then(parseParticipants)
	const aiGroupUpdateSubject = (jid: string, subject: string) =>
		aiGroupQuery(jid, 'set', [{ tag: 'subject', attrs: {}, content: Buffer.from(subject) }]).then(() => undefined)
	const aiGroupInviteCode = async (jid: string) =>
		getBinaryNodeChild(await aiGroupQuery(jid, 'get', [{ tag: 'invite', attrs: {} }]), 'invite')?.attrs.code
	const aiGroupRevokeInvite = aiGroupInviteCode
	const aiGroupAcceptInvite = async (code: string) =>
		getBinaryNodeChild(await aiGroupQuery(S_WHATSAPP_NET, 'set', [{ tag: 'invite', attrs: { code } }]), 'group')?.attrs
			.jid
	const aiGroupSettingUpdate = (jid: string, setting: string) =>
		aiGroupQuery(jid, 'set', [{ tag: setting, attrs: {} }]).then(() => undefined)
	const aiGroupToggleEphemeral = (jid: string, ephemeralExpiration: number) =>
		aiGroupQuery(
			jid,
			'set',
			ephemeralExpiration
				? [{ tag: 'ephemeral', attrs: { expiration: String(ephemeralExpiration) } }]
				: [{ tag: 'not_ephemeral', attrs: {} }]
		).then(() => undefined)

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
	}
}
