const protocolBackoffs = new Map<string, Promise<void>>()

export const setProtocolBackoffMs = (protocolName: string, ms: number) => {
	protocolBackoffs.set(protocolName, new Promise(resolve => setTimeout(resolve, ms)))
}

export const waitForBackoff = async (query: { context: string; protocols: Array<{ name: string }> }) => {
	if (query.context === 'interactive') return
	if (
		(query.context === 'message' || query.context === 'voip') &&
		query.protocols.some(protocol => protocol.name === 'devices')
	)
		return
	await Promise.all(query.protocols.map(protocol => protocolBackoffs.get(protocol.name)))
}
