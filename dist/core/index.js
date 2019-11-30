"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ioc_1 = require("../ioc");
const constants_1 = require("../constants");
const koa_1 = require("../runtime/koa");
exports.createApplication = (options = {}) => {
    const controllers = new Set();
    const controllerPoll = ioc_1.instancePoll.getAll(constants_1.META_INJECT);
    for (let [Controller, tag] of controllerPoll) {
        if (ioc_1.instancePoll.has(constants_1.META_PROVIDE, tag)) {
            const injectableModel = ioc_1.instancePoll.get(constants_1.META_PROVIDE, tag);
            const controller = new Controller(new injectableModel());
            controllers.add(controller);
        }
        else {
            throw new Error(`not ${tag} model is injectable`);
        }
    }
    const app = koa_1.default(controllers, options);
    return app;
};
exports.Controller = (path = '/') => {
    return function (constructor) {
        console.log(constructor);
        Reflect.defineMetadata(constants_1.META_CONTROLLER, path, constructor);
        return constructor;
    };
};
