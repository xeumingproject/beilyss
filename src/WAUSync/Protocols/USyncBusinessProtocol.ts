import type { USyncQueryProtocol } from '../../Types/USync'
import { assertNodeErrorFree, type BinaryNode, getBinaryNodeChild, getBinaryNodeChildren } from '../../WABinary'
import type { USyncUser } from '../USyncUser'

export type BusinessInfo = {
	verifiedName: unknown | null
	verifiedLevel: string | null
	verifiedNameLevel: string | null
	profileTag: string | null
	pnJid: string | null
	businessHours: {
		timezone: string | null
		config: Array<{ dayOfWeek: string | null; openTime: string | null; closeTime: string | null; mode: string | null }>
	} | null
	businessAddress: string | null
	catalogStatus: { exists: boolean; sendAll: boolean } | null
	cartEnabled: boolean | null
	webCartEnabled: boolean | null
	webCartOnOff: string | null
	commerceExperience: string | null
}

export class USyncBusinessProtocol implements USyncQueryProtocol {
	name = 'business'
	constructor(public profileVersion = '2') {}
	getQueryElement(): BinaryNode {
		return {
			tag: 'business',
			attrs: {},
			content: [
				{ tag: 'verified_name', attrs: {} },
				{ tag: 'profile', attrs: { v: this.profileVersion } }
			]
		}
	}
	getUserElement(user: USyncUser): BinaryNode | null {
		if (!user.verifiedNameSerial && !user.businessProfileTag) return null
		return {
			tag: 'business',
			attrs: {},
			content: [
				{ tag: 'verified_name', attrs: user.verifiedNameSerial ? { serial: user.verifiedNameSerial } : {} },
				{ tag: 'profile', attrs: user.businessProfileTag ? { tag: user.businessProfileTag } : {} }
			]
		}
	}
	parser(node: BinaryNode): BusinessInfo | null {
		if (node.tag !== 'business') return null
		assertNodeErrorFree(node)
		const verified = getBinaryNodeChild(node, 'verified_name')
		const profile = getBinaryNodeChild(node, 'profile')
		const hours = getBinaryNodeChild(profile, 'business_hours')
		return {
			verifiedName: verified?.attrs.name ?? null,
			verifiedLevel: verified?.attrs.level ?? null,
			verifiedNameLevel: verified?.attrs.name_level ?? null,
			profileTag: profile?.attrs.tag ?? null,
			pnJid: profile?.attrs.wid ?? null,
			businessHours: hours
				? {
						timezone: hours.attrs.timezone ?? null,
						config: getBinaryNodeChildren(hours, 'business_hours_config').map(item => ({
							dayOfWeek: item.attrs.day_of_week ?? null,
							openTime: item.attrs.open_time ?? null,
							closeTime: item.attrs.close_time ?? null,
							mode: item.attrs.mode ?? null
						}))
					}
				: null,
			businessAddress: profile?.attrs.address ?? null,
			catalogStatus: profile
				? { exists: profile.attrs.catalog_exists === 'true', sendAll: profile.attrs.catalog_send_all === 'true' }
				: null,
			cartEnabled: profile?.attrs.cart_enabled == null ? null : profile.attrs.cart_enabled === 'true',
			webCartEnabled: profile?.attrs.web_cart_enabled == null ? null : profile.attrs.web_cart_enabled === 'true',
			webCartOnOff: profile?.attrs.web_cart_on_off ?? null,
			commerceExperience: profile?.attrs.commerce_experience ?? null
		}
	}
}
