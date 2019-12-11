"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
exports.Params = (tags = []) => (target, propertyKey, paramIndex) => {
    Reflect.defineMetadata(constants_1.META_PARAMS, {
        index: paramIndex,
        tags
    }, target[propertyKey]);
};
exports.getParamsHeandler = (ctx, paramMeta) => {
    const { index, tags } = paramMeta;
    const allParams = {
        body: ctx.request.body,
        query: ctx.request.query,
        params: ctx.params
    };
    let result;
    if (tags.length === 0) {
        result = allParams;
    }
    else if (tags.length === 1) {
        result = allParams[tags[0]];
    }
    else {
        result = tags.reduce((pre, item) => {
            pre[item] = allParams[item];
            return pre;
        }, {});
    }
    return [index, result];
};
