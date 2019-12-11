"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioc_1 = require("../ioc");
const constants_1 = require("../constants");
const koa_1 = require("../runtime/koa");
const CONTROLLER_POLL = Object.create(null);
exports.createApplication = (options = {}) => {
    const controllers = new Set();
    const controllerPoll = Reflect.getMetadata(constants_1.META_CONTROLLER, CONTROLLER_POLL);
    for (let controllerMeta of controllerPoll) {
        const { path, constructor } = controllerMeta;
        const controller = new constructor();
        if (!('_isExtends' in controller)) {
            throw new Error(`class ${constructor.name} not extends BaseController`);
        }
        const injects = Reflect.getMetadata(constants_1.META_INJECT, controller);
        if (injects) {
            for (let inject of injects) {
                const { propertyKey, tag } = inject;
                const injectable = ioc_1.instancePoll.get(tag);
                if (injectable) {
                    Object.defineProperty(controller, propertyKey, {
                        value: new injectable(),
                        writable: false,
                        configurable: false,
                        enumerable: true
                    });
                }
                else {
                    throw new Error(`not ${String(tag)} model is injectable`);
                }
            }
        }
        controllers.add({
            controller,
            path
        });
    }
    const app = koa_1.default(controllers, options);
    return app;
};
exports.Controller = (path = '/') => {
    return function (constructor) {
        const controllerPoll = Reflect.getMetadata(constants_1.META_CONTROLLER, CONTROLLER_POLL);
        if (controllerPoll) {
            Reflect.defineMetadata(constants_1.META_CONTROLLER, controllerPoll.concat([
                {
                    path,
                    constructor
                }
            ]), CONTROLLER_POLL);
        }
        else {
            Reflect.defineMetadata(constants_1.META_CONTROLLER, [
                {
                    path,
                    constructor
                }
            ], CONTROLLER_POLL);
        }
        return constructor;
    };
};
