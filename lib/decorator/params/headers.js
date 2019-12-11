"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
exports.Headers = (tags = []) => (target, propertyKey, paramIndex) => {
    Reflect.defineMetadata(constants_1.META_HEADERS, {
        index: paramIndex,
        tags
    }, target[propertyKey]);
};
exports.getHeadersHandler = (ctx, paramMeta) => {
    const { index, tags } = paramMeta;
    const rawHeaders = ctx.req.headers;
    let result;
    if (tags.length === 0) {
        result = rawHeaders;
    }
    else if (tags.length === 1) {
        result = rawHeaders[tags[0]];
    }
    else {
        result = tags.reduce((pre, item) => {
            pre[item] = rawHeaders[item];
            return pre;
        }, {});
    }
    return [index, result];
};
