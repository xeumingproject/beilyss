import { assertNodeErrorFree } from '../../WABinary/index.js';
export class USyncPictureProtocol {
    constructor(type = 'image') {
        this.type = type;
        this.name = 'picture';
    }
    getQueryElement() {
        return { tag: 'picture', attrs: { type: this.type } };
    }
    getUserElement(user) {
        return user.pictureId ? { tag: 'picture', attrs: { id: user.pictureId } } : null;
    }
    parser(node) {
        if (node.tag !== 'picture')
            return null;
        assertNodeErrorFree(node);
        const id = node.attrs.id ?? null;
        const directPath = node.attrs.direct_path ?? null;
        return id || directPath ? { id, directPath, hash: node.attrs.eurl ?? null } : null;
    }
}
//# sourceMappingURL=USyncPictureProtocol.js.map