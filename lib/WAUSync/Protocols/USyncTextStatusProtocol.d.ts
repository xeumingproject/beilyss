import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
import type { USyncUser } from '../USyncUser.js';
export declare class USyncTextStatusProtocol implements USyncQueryProtocol {
    name: string;
    getQueryElement(): BinaryNode;
    getUserElement(_user: USyncUser): null;
    parser(node: BinaryNode): {
        text: string | null;
        emoji: string | null;
        setAt: Date;
        expiresAt: Date | null;
    } | null;
}
//# sourceMappingURL=USyncTextStatusProtocol.d.ts.map