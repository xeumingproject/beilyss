import type { BinaryNode } from '../WABinary'
import { getBinaryNodeChild, getBinaryNodeChildren, S_WHATSAPP_NET } from '../WABinary'
import { executeWMexQuery } from './mex'

export const INTEROP_MEX_QUERY_IDS = {
	CREATE_GROUP: '25726817620301611',
	LEAVE_GROUP: '25346167795013271',
	ADD_PARTICIPANTS: '25732168276369451',
	QUERY_GROUP_INFO: '32734144032867938',
	PRIVACY_SETTINGS_QUERY: '24849123668112654',
	PRIVACY_SETTINGS_UPDATE: '25421856497452763',
	PRIVACY_SETTINGS_WITH_CONTACT_LIST: '24913399124998598'
} as const

export const INTEGRATOR_BIRDYCHAT = 12
export const INTEGRATOR_HAIKET = 13
const MAX_INTEROP_BATCH = 256

type InteropSocket = {
	query: (node: BinaryNode) => Promise<BinaryNode>
	generateMessageTag: () => string
	logger: { info: (obj: object, msg: string) => void; warn: (obj: object, msg: string) => void }
	signalRepository: { deleteSession: (jids: string[]) => Promise<void> }
}

type InteropUser = { externalId: string; integratorId: number }

export const makeInteropSocket = <T extends InteropSocket>(sock: T) => {
	const mex = <R>(variables: Record<string, unknown>, queryId: string, dataPath: string) =>
		executeWMexQuery<R>(variables, queryId, dataPath, sock.query, sock.generateMessageTag)
	const fetchIntegrators = async () => {
		const result = await sock.query({
			tag: 'iq',
			attrs: { type: 'get', xmlns: 'w:interop', to: S_WHATSAPP_NET },
			content: [{ tag: 'integrator', attrs: { fetch: 'all' } }]
		})
		const list = getBinaryNodeChild(result, 'integrator_list')
		if (!list) return []
		const optedIn = list.attrs.opted_in === 'true'
		return getBinaryNodeChildren(list, 'integrator').map(node => {
			const features = getBinaryNodeChild(node, 'features')
			return {
				id: Number(node.attrs.id),
				name: node.attrs.name,
				status: node.attrs.status,
				icon: node.attrs.icon,
				identifierType: node.attrs.identifier_type,
				optedIn: node.attrs.opted_in === 'true' || optedIn,
				features: { groupMessaging: features?.attrs.group_messaging === 'true' }
			}
		})
	}

	const sendTOSTrackable = (id: string, result: string) =>
		sock
			.query({
				tag: 'iq',
				attrs: { to: S_WHATSAPP_NET, type: 'set', xmlns: 'tos' },
				content: [{ tag: 'trackable', attrs: { id, result } }]
			})
			.then(() => undefined)
	const acceptInteropTOS = async () => {
		await sendTOSTrackable('20240306', '105')
		await sendTOSTrackable('20240306', '160')
	}

	const updateIntegratorOptIn = (tag: 'opt_in_integrators' | 'opt_out_integrators', ids: number[]) =>
		sock
			.query({
				tag: 'iq',
				attrs: { type: 'set', xmlns: 'w:interop', to: S_WHATSAPP_NET },
				content: [
					{
						tag,
						attrs: {},
						content: [
							{
								tag: 'integrator_list',
								attrs: {},
								content: ids.map(id => ({ tag: 'integrator', attrs: { id: String(id) } }))
							}
						]
					}
				]
			})
			.then(() => undefined)
	const optInIntegrators = (ids = [INTEGRATOR_BIRDYCHAT, INTEGRATOR_HAIKET]) =>
		updateIntegratorOptIn('opt_in_integrators', ids)
	const optOutIntegrators = (ids = [INTEGRATOR_BIRDYCHAT, INTEGRATOR_HAIKET]) =>
		updateIntegratorOptIn('opt_out_integrators', ids)
	const resolveInteropUsers = async (users: InteropUser[]) => {
		if (users.length > MAX_INTEROP_BATCH)
			throw new Error(`resolveInteropUsers: max ${MAX_INTEROP_BATCH} users per request`)
		if (!users.length) return []
		const result = await sock.query({
			tag: 'iq',
			attrs: { type: 'get', xmlns: 'w:interop', to: S_WHATSAPP_NET },
			content: [
				{
					tag: 'users',
					attrs: {},
					content: users.map(user => ({
						tag: 'user',
						attrs: { external_id: user.externalId, integrator_id: String(user.integratorId) }
					}))
				}
			]
		})
		const usersNode = getBinaryNodeChild(result, 'users')
		return getBinaryNodeChildren(usersNode, 'user').map(node => {
			const error = getBinaryNodeChild(node, 'error')
			return error
				? {
						externalId: node.attrs.external_id,
						integratorId: Number(node.attrs.integrator_id),
						error: { code: Number(error.attrs.code), text: error.attrs.text }
					}
				: {
						jid: node.attrs.jid,
						externalId: node.attrs.external_id,
						normalizedExternalId: node.attrs.normalized_external_id,
						integratorId: Number(node.attrs.integrator_id)
					}
		})
	}

	const resolveInteropUser = async (externalId: string, integratorId: number) =>
		(await resolveInteropUsers([{ externalId, integratorId }]))[0] ?? null
	const getReachabilitySettings = async () => {
		const result = await sock.query({
			tag: 'iq',
			attrs: { type: 'get', xmlns: 'w:interop', to: S_WHATSAPP_NET },
			content: [{ tag: 'reachability_settings', attrs: {} }]
		})
		const node = getBinaryNodeChild(result, 'reachability_settings')
		return node
			? {
					enabled: node.attrs.enabled,
					users: getBinaryNodeChildren(node, 'user').map(user => ({
						externalId: user.attrs.external_id,
						integratorId: Number(user.attrs.integrator_id),
						jid: user.attrs.jid
					}))
				}
			: null
	}

	const setReachabilitySettings = (users: InteropUser[], enabled = 'true') =>
		sock
			.query({
				tag: 'iq',
				attrs: { type: 'set', xmlns: 'w:interop', to: S_WHATSAPP_NET },
				content: [
					{
						tag: 'reachability_settings',
						attrs: { enabled },
						content: users.map(user => ({
							tag: 'user',
							attrs: { external_id: user.externalId, integrator_id: String(user.integratorId) }
						}))
					}
				]
			})
			.then(() => undefined)
	const updateInteropBlockStatus = (jid: string, action: 'block' | 'unblock') =>
		sock
			.query({
				tag: 'iq',
				attrs: { type: 'set', xmlns: 'w:interop', to: S_WHATSAPP_NET },
				content: [{ tag: 'blocklist', attrs: {}, content: [{ tag: 'item', attrs: { action, jid } }] }]
			})
			.then(() => undefined)
	const blockInteropUser = (jid: string) => updateInteropBlockStatus(jid, 'block')
	const unblockInteropUser = (jid: string) => updateInteropBlockStatus(jid, 'unblock')
	const reportInteropSpam = (jid: string, spamFlow = 'account_info_block') =>
		sock
			.query({
				tag: 'iq',
				attrs: { type: 'set', xmlns: 'spam', to: S_WHATSAPP_NET },
				content: [{ tag: 'spam_list', attrs: { jid, spam_flow: spamFlow } }]
			})
			.then(() => undefined)
	const trustInteropContact = (jid: string) =>
		sock
			.query({
				tag: 'iq',
				attrs: { to: S_WHATSAPP_NET, xmlns: 'privacy', type: 'set' },
				content: [
					{
						tag: 'tokens',
						attrs: {},
						content: [
							{ tag: 'token', attrs: { jid, type: 'trusted_contact', t: String(Math.floor(Date.now() / 1000)) } }
						]
					}
				]
			})
			.then(() => undefined)
	const initInterop = async () => {
		try {
			const integrators = await fetchIntegrators()
			const active = integrators.filter(
				integrator => integrator.status === 'active' || integrator.status === 'onboarding'
			)
			if (active.length) {
				await acceptInteropTOS()
				await optInIntegrators(active.map(integrator => integrator.id))
			}

			return integrators
		} catch (err) {
			sock.logger.warn({ err }, 'interop initialization failed')
			return []
		}
	}

	const createInteropGroup = (participants: string[]) =>
		mex(
			{ input: { participants: participants.map(jid => ({ jid })) } },
			INTEROP_MEX_QUERY_IDS.CREATE_GROUP,
			'xwa2_interop_group_create'
		)
	const leaveInteropGroup = (jids: string | string[]) => {
		const ids = Array.isArray(jids) ? jids : [jids]
		return mex(
			{ input: { groups_to_leave: ids.map(gid => ({ gid: gid.replace(/@[^@]+$/, '') })) } },
			INTEROP_MEX_QUERY_IDS.LEAVE_GROUP,
			'xwa2_interop_group_leave'
		)
	}

	const addParticipantsToInteropGroup = (groupJid: string, participants: string[]) =>
		mex(
			{ input: { gid: groupJid.replace(/@[^@]+$/, ''), participants: participants.map(jid => ({ jid })) } },
			INTEROP_MEX_QUERY_IDS.ADD_PARTICIPANTS,
			'xwa2_interop_add_participants_to_group'
		)
	const queryInteropGroupInfo = (groupJid: string) =>
		mex(
			{ group_input: { gid: groupJid.replace(/@[^@]+$/, '') } },
			INTEROP_MEX_QUERY_IDS.QUERY_GROUP_INFO,
			'xwa2_interop_group_query_by_id'
		)
	const queryInteropPrivacySettings = () =>
		mex({}, INTEROP_MEX_QUERY_IDS.PRIVACY_SETTINGS_QUERY, 'xwa2_interop_privacy_settings')
	const updateInteropPrivacySetting = (feature: string, setting: string) =>
		mex({ feature, setting }, INTEROP_MEX_QUERY_IDS.PRIVACY_SETTINGS_UPDATE, 'xwa2_interop_privacy_setting_update')
	const updateInteropPrivacySettingWithContactList = (
		feature: string,
		setting: string,
		contacts: string[],
		contactListType: string,
		dhash = 'none'
	) =>
		mex(
			{ feature, setting, contacts, contact_list_type: contactListType, dhash },
			INTEROP_MEX_QUERY_IDS.PRIVACY_SETTINGS_WITH_CONTACT_LIST,
			'xwa2_interop_privacy_setting_with_contact_list_update'
		)
	const getInteropGroupAddPrivacy = async (jid: string, integratorId: number) => {
		const result = await sock.query({
			tag: 'iq',
			attrs: { type: 'get', xmlns: 'w:interop', to: S_WHATSAPP_NET },
			content: [
				{
					tag: 'privacy',
					attrs: { feature: 'GROUPADD' },
					content: [{ tag: 'user', attrs: { jid, integrator_id: String(integratorId) } }]
				}
			]
		})
		return getBinaryNodeChild(getBinaryNodeChild(result, 'privacy'), 'user')?.attrs.result === 'allowed'
	}

	return {
		...sock,
		fetchIntegrators,
		acceptInteropTOS,
		optInIntegrators,
		optOutIntegrators,
		resolveInteropUsers,
		resolveInteropUser,
		getReachabilitySettings,
		setReachabilitySettings,
		blockInteropUser,
		unblockInteropUser,
		reportInteropSpam,
		trustInteropContact,
		initInterop,
		createInteropGroup,
		leaveInteropGroup,
		addParticipantsToInteropGroup,
		queryInteropGroupInfo,
		queryInteropPrivacySettings,
		updateInteropPrivacySetting,
		updateInteropPrivacySettingWithContactList,
		getInteropGroupAddPrivacy,
		INTEGRATOR_BIRDYCHAT,
		INTEGRATOR_HAIKET,
		INTEROP_MEX_QUERY_IDS
	}
}
