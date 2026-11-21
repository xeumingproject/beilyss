import { assertNodeErrorFree, getBinaryNodeChild, getBinaryNodeChildren } from '../../WABinary/index.js';
export class USyncBusinessProtocol {
    constructor(profileVersion = '2') {
        this.profileVersion = profileVersion;
        this.name = 'business';
    }
    getQueryElement() {
        return {
            tag: 'business',
            attrs: {},
            content: [
                { tag: 'verified_name', attrs: {} },
                { tag: 'profile', attrs: { v: this.profileVersion } }
            ]
        };
    }
    getUserElement(user) {
        if (!user.verifiedNameSerial && !user.businessProfileTag)
            return null;
        return {
            tag: 'business',
            attrs: {},
            content: [
                { tag: 'verified_name', attrs: user.verifiedNameSerial ? { serial: user.verifiedNameSerial } : {} },
                { tag: 'profile', attrs: user.businessProfileTag ? { tag: user.businessProfileTag } : {} }
            ]
        };
    }
    parser(node) {
        if (node.tag !== 'business')
            return null;
        assertNodeErrorFree(node);
        const verified = getBinaryNodeChild(node, 'verified_name');
        const profile = getBinaryNodeChild(node, 'profile');
        const hours = getBinaryNodeChild(profile, 'business_hours');
        return {
            verifiedName: verified?.attrs.name ?? null,
            verifiedLevel: verified?.attrs.level ?? null,
            verifiedNameLevel: verified?.attrs.name_level ?? null,
            profileTag: profile?.attrs.tag ?? null,
            pnJid: profile?.attrs.wid ?? null,
            businessHours: hours
                ? {
                    timezone: hours.attrs.timezone ?? null,
                    config: getBinaryNodeChildren(hours, 'business_hours_config').map(item => ({
                        dayOfWeek: item.attrs.day_of_week ?? null,
                        openTime: item.attrs.open_time ?? null,
                        closeTime: item.attrs.close_time ?? null,
                        mode: item.attrs.mode ?? null
                    }))
                }
                : null,
            businessAddress: profile?.attrs.address ?? null,
            catalogStatus: profile
                ? { exists: profile.attrs.catalog_exists === 'true', sendAll: profile.attrs.catalog_send_all === 'true' }
                : null,
            cartEnabled: profile?.attrs.cart_enabled == null ? null : profile.attrs.cart_enabled === 'true',
            webCartEnabled: profile?.attrs.web_cart_enabled == null ? null : profile.attrs.web_cart_enabled === 'true',
            webCartOnOff: profile?.attrs.web_cart_on_off ?? null,
            commerceExperience: profile?.attrs.commerce_experience ?? null
        };
    }
}
//# sourceMappingURL=USyncBusinessProtocol.js.map