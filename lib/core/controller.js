"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Koa = require("koa");
class BaseController extends Koa {
    constructor() {
        super(...arguments);
        this._isExtends = Symbol.for('BaseController#isExtends');
    }
}
exports.default = BaseController;
