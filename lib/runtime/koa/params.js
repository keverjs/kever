"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const params_1 = require("../../decorator/params");
const paramMap = {
    [constants_1.META_HEADERS]: params_1.getHeadersHandler,
    [constants_1.META_REQ]: (ctx, index) => [index, ctx.req],
    [constants_1.META_RES]: (ctx, index) => [index, ctx.res],
    [constants_1.META_COOKIE]: (ctx, index) => [index, ctx.cookie],
    [constants_1.META_PARAMS]: params_1.getParamsHeandler
};
exports.default = (routeFunction, ctx) => {
    let routeParams = [];
    Object.getOwnPropertySymbols(paramMap).forEach(paramKey => {
        const paramMeta = Reflect.getMetadata(paramKey, routeFunction);
        if (paramMeta) {
            const [paramIndex, paramResult] = paramMap[paramKey](ctx, paramMeta);
            routeParams[paramIndex] = paramResult;
        }
    });
    return routeParams;
};
