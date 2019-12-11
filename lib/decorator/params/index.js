"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../../constants");
const headers_1 = require("./headers");
exports.Headers = headers_1.Headers;
exports.getHeadersHandler = headers_1.getHeadersHandler;
const params_1 = require("./params");
exports.Params = params_1.Params;
exports.getParamsHeandler = params_1.getParamsHeandler;
const Req = createParamDecorator(constants_1.META_REQ);
exports.Req = Req;
const Res = createParamDecorator(constants_1.META_RES);
exports.Res = Res;
const Cookie = createParamDecorator(constants_1.META_COOKIE);
exports.Cookie = Cookie;
function createParamDecorator(key) {
    return () => (target, propertyKey, paramIndex) => {
        Reflect.defineMetadata(key, paramIndex, target[propertyKey]);
    };
}
