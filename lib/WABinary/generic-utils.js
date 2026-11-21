import { Boom } from '@hapi/boom';
import { proto } from '../../WAProto/index.js';
import { unixTimestampSeconds } from '../Utils/generics.js';
import {} from './types.js';
const indexCache = new WeakMap();
export const getBinaryNodeChildren = (node, childTag) => {
    if (!node || !Array.isArray(node.content))
        return [];
    let index = indexCache.get(node);
    if (!index) {
        index = new Map();
        for (const child of node.content) {
            let arr = index.get(child.tag);
            if (!arr)
                index.set(child.tag, (arr = []));
            arr.push(child);
        }
        indexCache.set(node, index);
    }
    return index.get(childTag) || [];
};
export const getBinaryNodeChild = (node, childTag) => {
    return getBinaryNodeChildren(node, childTag)[0];
};
export const getAllBinaryNodeChildren = ({ content }) => {
    if (Array.isArray(content)) {
        return content;
    }
    return [];
};
export const getBinaryNodeChildBuffer = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content;
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return child;
    }
};
export const getBinaryNodeChildString = (node, childTag) => {
    const child = getBinaryNodeChild(node, childTag)?.content;
    if (Buffer.isBuffer(child) || child instanceof Uint8Array) {
        return Buffer.from(child).toString('utf-8');
    }
    else if (typeof child === 'string') {
        return child;
    }
};
export const getBinaryNodeChildUInt = (node, childTag, length) => {
    const buff = getBinaryNodeChildBuffer(node, childTag);
    if (buff) {
        return bufferToUInt(buff, length);
    }
};
export const assertNodeErrorFree = (node) => {
    const errNode = getBinaryNodeChild(node, 'error');
    if (errNode) {
        throw new Boom(errNode.attrs.text || 'Unknown error', { data: +errNode.attrs.code });
    }
};
export const reduceBinaryNodeToDictionary = (node, tag) => {
    const nodes = getBinaryNodeChildren(node, tag);
    const dict = nodes.reduce((dict, { attrs }) => {
        if (typeof attrs.name === 'string') {
            dict[attrs.name] = attrs.value || attrs.config_value;
        }
        else {
            dict[attrs.config_code] = attrs.value || attrs.config_value;
        }
        return dict;
    }, {});
    return dict;
};
export const getBinaryNodeMessages = ({ content }) => {
    const msgs = [];
    if (Array.isArray(content)) {
        for (const item of content) {
            if (item.tag === 'message') {
                msgs.push(proto.WebMessageInfo.decode(item.content).toJSON());
            }
        }
    }
    return msgs;
};
function bufferToUInt(e, t) {
    let a = 0;
    for (let i = 0; i < t; i++) {
        a = 256 * a + e[i];
    }
    return a;
}
const tabs = (n) => '\t'.repeat(n);
export function binaryNodeToString(node, i = 0) {
    if (!node) {
        return node;
    }
    if (typeof node === 'string') {
        return tabs(i) + node;
    }
    if (node instanceof Uint8Array) {
        return tabs(i) + Buffer.from(node).toString('hex');
    }
    if (Array.isArray(node)) {
        return node.map(x => tabs(i + 1) + binaryNodeToString(x, i + 1)).join('\n');
    }
    const children = binaryNodeToString(node.content, i + 1);
    const tag = `<${node.tag} ${Object.entries(node.attrs || {})
        .filter(([, v]) => v !== undefined)
        .map(([k, v]) => `${k}='${v}'`)
        .join(' ')}`;
    const content = children ? `>\n${children}\n${tabs(i)}</${node.tag}>` : '/>';
    return tag + content;
}
export const getBinaryNodeFilter = (node) => {
    if (!Array.isArray(node))
        return false;
    return node.some(item => {
        const firstChild = Array.isArray(item?.content) ? item.content[0] : undefined;
        const nestedChild = firstChild && typeof firstChild === 'object' && Array.isArray(firstChild.content)
            ? firstChild.content[0]
            : undefined;
        const nestedTag = nestedChild && typeof nestedChild === 'object' ? nestedChild.tag : '';
        const firstTag = firstChild && typeof firstChild === 'object' ? firstChild.tag : '';
        return (['native_flow'].includes(nestedTag) ||
            ['interactive', 'buttons', 'list'].includes(firstTag) ||
            ['hsm', 'biz'].includes(item?.tag) ||
            (item?.tag === 'bot' && item?.attrs?.biz_bot === '1'));
    });
};
export const getAdditionalNode = (name) => {
    if (name)
        name = name.toLowerCase();
    const ts = unixTimestampSeconds(new Date()) - 77980457;
    const order_response_name = {
        review_and_pay: 'order_details',
        review_order: 'order_status',
        order_status: 'order_status',
        payment_info: 'payment_info',
        payment_status: 'payment_status',
        payment_method: 'payment_method',
        catalog_message: 'catalog_message'
    };
    const flow_name = {
        cta_catalog: 'cta_catalog',
        mpm: 'mpm',
        call_request: 'call_permission_request',
        view_catalog: 'automated_greeting_message_view_catalog',
        wa_pay_detail: 'wa_payment_transaction_details',
        send_location: 'send_location',
        payment_key_info: 'payment_key_info'
    };
    if (name && order_response_name[name]) {
        return [
            {
                tag: 'biz',
                attrs: {
                    native_flow_name: order_response_name[name]
                },
                content: []
            }
        ];
    }
    else if ((name && flow_name[name]) || name === 'interactive' || name === 'buttons') {
        return [
            {
                tag: 'biz',
                attrs: {
                    actual_actors: '2',
                    host_storage: '2',
                    privacy_mode_ts: `${ts}`
                },
                content: [
                    {
                        tag: 'engagement',
                        attrs: {
                            customer_service_state: 'open',
                            conversation_state: 'open'
                        }
                    },
                    {
                        tag: 'interactive',
                        attrs: {
                            type: 'native_flow',
                            v: '1'
                        },
                        content: [
                            {
                                tag: 'native_flow',
                                attrs: {
                                    v: '9',
                                    name: name ? (flow_name[name] ?? 'mixed') : 'mixed'
                                },
                                content: []
                            }
                        ]
                    }
                ]
            }
        ];
    }
    else {
        return [
            {
                tag: 'biz',
                attrs: {
                    actual_actors: '2',
                    host_storage: '2',
                    privacy_mode_ts: `${ts}`
                },
                content: [
                    {
                        tag: 'engagement',
                        attrs: {
                            customer_service_state: 'open',
                            conversation_state: 'open'
                        }
                    }
                ]
            }
        ];
    }
};
export const getBinaryFilteredBizBot = (nodeContent) => {
    if (!Array.isArray(nodeContent))
        return false;
    return nodeContent.some(b => ['bot'].includes(b?.tag) && b?.attrs?.biz_bot === '1');
};
export const getButtonArgs = (message) => {
    const nativeFlow = message.interactiveMessage?.nativeFlowMessage;
    const firstButtonName = nativeFlow?.buttons?.[0]?.name;
    const nativeFlowSpecials = [
        'mpm',
        'cta_catalog',
        'send_location',
        'call_permission_request',
        'wa_payment_transaction_details',
        'automated_greeting_message_view_catalog'
    ];
    if (nativeFlow && (firstButtonName === 'review_and_pay' || firstButtonName === 'payment_info')) {
        return {
            tag: 'biz',
            attrs: {
                native_flow_name: firstButtonName === 'review_and_pay' ? 'order_details' : firstButtonName || ''
            }
        };
    }
    else if (nativeFlow && firstButtonName && nativeFlowSpecials.includes(firstButtonName)) {
        return {
            tag: 'biz',
            attrs: {
                actual_actors: '2',
                host_storage: '2',
                privacy_mode_ts: unixTimestampSeconds().toString()
            },
            content: [
                {
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [
                        {
                            tag: 'native_flow',
                            attrs: {
                                v: '2',
                                name: firstButtonName
                            }
                        }
                    ]
                },
                {
                    tag: 'quality_control',
                    attrs: {
                        source_type: 'third_party'
                    }
                }
            ]
        };
    }
    else if (nativeFlow || message.buttonsMessage) {
        return {
            tag: 'biz',
            attrs: {
                actual_actors: '2',
                host_storage: '2',
                privacy_mode_ts: unixTimestampSeconds().toString()
            },
            content: [
                {
                    tag: 'interactive',
                    attrs: {
                        type: 'native_flow',
                        v: '1'
                    },
                    content: [
                        {
                            tag: 'native_flow',
                            attrs: {
                                v: '9',
                                name: 'mixed'
                            }
                        }
                    ]
                },
                {
                    tag: 'quality_control',
                    attrs: {
                        source_type: 'third_party'
                    }
                }
            ]
        };
    }
    else if (message.listMessage) {
        return {
            tag: 'biz',
            attrs: {
                actual_actors: '2',
                host_storage: '2',
                privacy_mode_ts: unixTimestampSeconds().toString()
            },
            content: [
                {
                    tag: 'list',
                    attrs: {
                        v: '2',
                        type: 'product_list'
                    }
                },
                {
                    tag: 'quality_control',
                    attrs: {
                        source_type: 'third_party'
                    }
                }
            ]
        };
    }
    else {
        return {
            tag: 'biz',
            attrs: {
                actual_actors: '2',
                host_storage: '2',
                privacy_mode_ts: unixTimestampSeconds().toString()
            }
        };
    }
};
export const getButtonType = (message) => {
    if (message.listMessage) {
        return 'list';
    }
    else if (message.buttonsMessage) {
        return 'buttons';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'review_and_pay') {
        return 'review_and_pay';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'review_order') {
        return 'review_order';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'payment_info') {
        return 'payment_info';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'payment_key_info') {
        return 'payment_key_info';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'payment_status') {
        return 'payment_status';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'payment_method') {
        return 'payment_method';
    }
    else if (message.interactiveMessage?.nativeFlowMessage?.buttons?.[0]?.name === 'catalog_message') {
        return 'catalog_message';
    }
    else if (message.interactiveMessage?.nativeFlowMessage) {
        return 'interactive';
    }
    else if (message.interactiveMessage?.nativeFlowMessage) {
        return 'native_flow';
    }
    return undefined;
};
//# sourceMappingURL=generic-utils.js.map