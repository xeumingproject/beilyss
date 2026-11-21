import type { USyncQueryProtocol } from '../../Types/USync'
import { assertNodeErrorFree, type BinaryNode } from '../../WABinary'
import type { USyncUser } from '../USyncUser'

export class USyncSidelistProtocol implements USyncQueryProtocol {
	name = 'sidelist'
	constructor(public useLidAddressing = true) {}
	getQueryElement(): BinaryNode {
		return { tag: 'sidelist', attrs: this.useLidAddressing ? { addressing_mode: 'lid' } : {} }
	}
	getUserElement(user: USyncUser): BinaryNode | null {
		return user.sidelistDelete ? { tag: 'sidelist', attrs: { type: 'delete' } } : null
	}
	parser(node: BinaryNode) {
		if (node.tag !== 'sidelist' && node.tag !== 'side_list') return null
		assertNodeErrorFree(node)
		return { type: node.attrs.type ?? null }
	}
}
