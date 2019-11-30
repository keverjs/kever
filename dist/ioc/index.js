"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const constants_1 = require("../constants");
class InstancePoll {
    constructor() {
        this.providePoll = new Map();
        this.injectPoll = new Map();
    }
    add(type, instanceMeta) {
        if (type === constants_1.META_PROVIDE) {
            this.providePoll.set(instanceMeta.key, instanceMeta.value);
        }
        if (type === constants_1.META_INJECT) {
            this.injectPoll.set(instanceMeta.value, instanceMeta.key);
        }
    }
    has(type, key) {
        if (type === constants_1.META_PROVIDE) {
            if (this.providePoll.has(key)) {
                return true;
            }
            return false;
        }
        else {
            if (this.injectPoll.has(key)) {
                return true;
            }
            return false;
        }
    }
    get(type, key) {
        if (type === constants_1.META_PROVIDE) {
            return this.providePoll.get(key);
        }
        else {
            return this.injectPoll.get(key);
        }
    }
    getAll(type) {
        if (type === constants_1.META_PROVIDE) {
            return this.providePoll;
        }
        else {
            return this.injectPoll;
        }
    }
}
exports.instancePoll = new InstancePoll();
exports.Provide = createIocDecorator(constants_1.META_PROVIDE);
exports.Inject = createIocDecorator(constants_1.META_INJECT);
function createIocDecorator(type) {
    return tag => target => {
        exports.instancePoll.add(type, {
            key: tag,
            value: target
        });
    };
}
