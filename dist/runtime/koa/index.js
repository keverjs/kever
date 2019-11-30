"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const constants_1 = require("../../constants");
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
        console.log(controller);
        const rootPath = Reflect.getMetadata(constants_1.META_CONTROLLER, controller.constructor);
        Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
            .filter(name => name !== 'constructor')
            .forEach(name => {
            const metaRoute = Reflect.getMetadata(constants_1.META_ROUTER, controller[name]);
            if (metaRoute) {
                const { method, path, beforePlugins, afterPlugins } = metaRoute;
                router[method](`${rootPath}${path}`, ...beforePlugins, async (ctx, next) => {
                    await controller[name](ctx, next);
                }, ...afterPlugins);
            }
        });
    }
    app.use(router.routes()).use(router.allowedMethods());
    return app;
}
exports.default = KoaRuntime;
