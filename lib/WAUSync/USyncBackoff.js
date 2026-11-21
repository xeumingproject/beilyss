const protocolBackoffs = new Map();
export const setProtocolBackoffMs = (protocolName, ms) => {
    protocolBackoffs.set(protocolName, new Promise(resolve => setTimeout(resolve, ms)));
};
export const waitForBackoff = async (query) => {
    if (query.context === 'interactive')
        return;
    if ((query.context === 'message' || query.context === 'voip') &&
        query.protocols.some(protocol => protocol.name === 'devices'))
        return;
    await Promise.all(query.protocols.map(protocol => protocolBackoffs.get(protocol.name)));
};
//# sourceMappingURL=USyncBackoff.js.map