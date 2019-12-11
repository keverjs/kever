"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
const Router = require("koa-router");
const middleware_1 = require("./middleware");
const params_1 = require("./params");
const constants_1 = require("../../constants");
const utils_1 = require("../../utils");
function KoaRuntime(controllers, options) {
    const app = new Koa();
    const router = new Router();
    const plugins = options.plugins || [];
    middleware_1.default(app, plugins);
    for (let controllerMeta of controllers) {
        const { path: rootPath, controller } = controllerMeta;
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
                        controller['ctx'] = ctx;
                        controller['next'] = next;
                        const routeParams = params_1.default(controller[name], ctx);
                        await controller[name](...routeParams);
                    }, ...afterPlugins);
                }
            }
        });
    }
    app.use(router.routes()).use(router.allowedMethods());
    return app;
}
exports.default = KoaRuntime;
