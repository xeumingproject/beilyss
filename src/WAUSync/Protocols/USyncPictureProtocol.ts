import type { USyncQueryProtocol } from '../../Types/USync'
import { assertNodeErrorFree, type BinaryNode } from '../../WABinary'
import type { USyncUser } from '../USyncUser'

export class USyncPictureProtocol implements USyncQueryProtocol {
	name = 'picture'
	constructor(public type = 'image') {}
	getQueryElement(): BinaryNode {
		return { tag: 'picture', attrs: { type: this.type } }
	}
	getUserElement(user: USyncUser): BinaryNode | null {
		return user.pictureId ? { tag: 'picture', attrs: { id: user.pictureId } } : null
	}
	parser(node: BinaryNode) {
		if (node.tag !== 'picture') return null
		assertNodeErrorFree(node)
		const id = node.attrs.id ?? null
		const directPath = node.attrs.direct_path ?? null
		return id || directPath ? { id, directPath, hash: node.attrs.eurl ?? null } : null
	}
}
