import type { USyncQueryProtocol } from '../../Types/USync'
import { assertNodeErrorFree, type BinaryNode, getBinaryNodeChild } from '../../WABinary'
import type { USyncUser } from '../USyncUser'

export class USyncTextStatusProtocol implements USyncQueryProtocol {
	name = 'text_status'
	getQueryElement(): BinaryNode {
		return { tag: 'text_status', attrs: {} }
	}
	getUserElement(_user: USyncUser): null {
		return null
	}
	parser(node: BinaryNode) {
		if (node.tag !== 'text_status') return null
		assertNodeErrorFree(node)
		const setAtSeconds = Number(node.attrs.last_update_time ?? 0)
		const duration = Number(node.attrs.ephemeral_duration_sec ?? 0)
		return {
			text: node.attrs.text ?? null,
			emoji: getBinaryNodeChild(node, 'emoji')?.attrs.content ?? null,
			setAt: new Date(setAtSeconds * 1000),
			expiresAt: duration ? new Date((setAtSeconds + duration) * 1000) : null
		}
	}
}
