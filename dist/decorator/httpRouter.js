"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
exports.Get = createHTTPMethodDecorator('get');
exports.Post = createHTTPMethodDecorator('post');
exports.Put = createHTTPMethodDecorator('put');
exports.Delete = createHTTPMethodDecorator('delete');
function createHTTPMethodDecorator(method) {
    return (path, aopPlugins = {}) => (target, propertyKey, descripator) => {
        let beforePlugins = new Set();
        let afterPlugins = new Set();
        const before = aopPlugins.before;
        const after = aopPlugins.after;
        if (before) {
            for (let plugin of before) {
                beforePlugins.add(plugin);
            }
        }
        if (after) {
            for (let plugin of after) {
                afterPlugins.add(plugin);
            }
        }
        Reflect.defineMetadata(constants_1.META_ROUTER, {
            method,
            path,
            beforePlugins,
            afterPlugins
        }, descripator.value);
    };
}
