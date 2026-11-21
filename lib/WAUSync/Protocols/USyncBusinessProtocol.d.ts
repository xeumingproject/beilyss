import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
import type { USyncUser } from '../USyncUser.js';
export type BusinessInfo = {
    verifiedName: unknown | null;
    verifiedLevel: string | null;
    verifiedNameLevel: string | null;
    profileTag: string | null;
    pnJid: string | null;
    businessHours: {
        timezone: string | null;
        config: Array<{
            dayOfWeek: string | null;
            openTime: string | null;
            closeTime: string | null;
            mode: string | null;
        }>;
    } | null;
    businessAddress: string | null;
    catalogStatus: {
        exists: boolean;
        sendAll: boolean;
    } | null;
    cartEnabled: boolean | null;
    webCartEnabled: boolean | null;
    webCartOnOff: string | null;
    commerceExperience: string | null;
};
export declare class USyncBusinessProtocol implements USyncQueryProtocol {
    profileVersion: string;
    name: string;
    constructor(profileVersion?: string);
    getQueryElement(): BinaryNode;
    getUserElement(user: USyncUser): BinaryNode | null;
    parser(node: BinaryNode): BusinessInfo | null;
}
//# sourceMappingURL=USyncBusinessProtocol.d.ts.map