export declare const setProtocolBackoffMs: (protocolName: string, ms: number) => void;
export declare const waitForBackoff: (query: {
    context: string;
    protocols: Array<{
        name: string;
    }>;
}) => Promise<void>;
//# sourceMappingURL=USyncBackoff.d.ts.map