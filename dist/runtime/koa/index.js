"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function KoaRuntime(controllers, options) {
    const app = new Koa();
    const router = new Router();
    const plugins = options.plugins || [];
    if (plugins.length) {
        for (let plugin of plugins) {
            app.use(plugin);
        }
    }
    for (let controller of controllers) {
        const rootPath = Reflect.getMetadata(constants_1.META_CONTROLLER, controller.constructor);
        if (!rootPath) {
            throw new Error('this class is not controller');
        }
        Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
            .filter(name => name !== 'constructor')
            .forEach(name => {
            const metaRoute = Reflect.getMetadata(constants_1.META_ROUTER, controller[name]);
            if (metaRoute) {
                const { methods, path, beforePlugins, afterPlugins } = metaRoute;
                const routePath = utils_1.resolvePath(rootPath, path);
                for (let method of methods) {
                    router[method](routePath, ...beforePlugins, async (ctx, next) => {
                        await controller[name](ctx, next);
                    }, ...afterPlugins);
                }
            }
        });
    }
    app.use(router.routes()).use(router.allowedMethods());
    return app;
}
exports.default = KoaRuntime;
