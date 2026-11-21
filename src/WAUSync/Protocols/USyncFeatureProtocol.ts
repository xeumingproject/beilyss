import type { USyncQueryProtocol } from '../../Types/USync'
import { type BinaryNode, getBinaryNodeChild } from '../../WABinary'
import type { USyncUser } from '../USyncUser'

export const USYNC_FEATURES = [
	'document',
	'encrypt',
	'encrypt_blist',
	'encrypt_contact',
	'encrypt_group_gen2',
	'encrypt_image',
	'encrypt_location',
	'encrypt_url',
	'encrypt_v2',
	'voip',
	'voip_legacy',
	'multi_agent',
	'bot_eligible'
]
const camel = (key: string) => key.replace(/_([a-z])/g, (_, char: string) => char.toUpperCase())

export class USyncFeatureProtocol implements USyncQueryProtocol {
	name = 'feature'
	constructor(public features = USYNC_FEATURES) {}
	getQueryElement(): BinaryNode {
		return { tag: 'feature', attrs: {}, content: this.features.map(feature => ({ tag: feature, attrs: {} })) }
	}
	getUserElement(_user: USyncUser): null {
		return null
	}
	parser(node: BinaryNode) {
		const error = getBinaryNodeChild(node, 'error')
		if (error) return { errorCode: Number(error.attrs.code), errorText: error.attrs.text }
		if (!Array.isArray(node.content)) return null
		return Object.fromEntries(
			node.content.filter(child => child.tag !== 'error').map(child => [camel(child.tag), child.attrs.value ?? true])
		)
	}
}
