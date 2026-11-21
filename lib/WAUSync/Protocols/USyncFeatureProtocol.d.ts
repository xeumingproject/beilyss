import type { USyncQueryProtocol } from '../../Types/USync.js';
import { type BinaryNode } from '../../WABinary/index.js';
import type { USyncUser } from '../USyncUser.js';
export declare const USYNC_FEATURES: string[];
export declare class USyncFeatureProtocol implements USyncQueryProtocol {
    features: string[];
    name: string;
    constructor(features?: string[]);
    getQueryElement(): BinaryNode;
    getUserElement(_user: USyncUser): null;
    parser(node: BinaryNode): {
        [k: string]: string | boolean;
    } | {
        errorCode: number;
        errorText: string | undefined;
    } | null;
}
//# sourceMappingURL=USyncFeatureProtocol.d.ts.map