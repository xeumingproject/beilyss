import { assertNodeErrorFree } from '../../WABinary/index.js';
export class USyncSidelistProtocol {
    constructor(useLidAddressing = true) {
        this.useLidAddressing = useLidAddressing;
        this.name = 'sidelist';
    }
    getQueryElement() {
        return { tag: 'sidelist', attrs: this.useLidAddressing ? { addressing_mode: 'lid' } : {} };
    }
    getUserElement(user) {
        return user.sidelistDelete ? { tag: 'sidelist', attrs: { type: 'delete' } } : null;
    }
    parser(node) {
        if (node.tag !== 'sidelist' && node.tag !== 'side_list')
            return null;
        assertNodeErrorFree(node);
        return { type: node.attrs.type ?? null };
    }
}
//# sourceMappingURL=USyncSidelistProtocol.js.map