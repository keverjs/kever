"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class InstancePoll {
    constructor() {
        this.injectablePoll = new Map();
    }
    add(key, instance) {
        this.injectablePoll.set(key, instance);
    }
    has(key) {
        if (this.injectablePoll.has(key)) {
            return true;
        }
        return false;
    }
    get(key) {
        return this.injectablePoll.get(key);
    }
}
exports.instancePoll = new InstancePoll();
exports.Injectable = (tag) => target => {
    exports.instancePoll.add(tag, target);
};
exports.Inject = (tag) => (target, propertyKey) => {
    const injects = Reflect.getMetadata(constants_1.META_INJECT, target);
    if (injects) {
        Reflect.defineMetadata(constants_1.META_INJECT, injects.concat([
            {
                propertyKey,
                tag
            }
        ]), target);
    }
    else {
        Reflect.defineMetadata(constants_1.META_INJECT, [
            {
                propertyKey,
                tag
            }
        ], target);
    }
};
