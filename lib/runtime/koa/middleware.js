"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const koaBody = require("koa-body");
const koa_cookie_1 = require("koa-cookie");
exports.default = (app, plugins) => {
    if (plugins.length) {
        for (let plugin of plugins) {
            app.use(plugin);
        }
    }
    app.use(koaBody());
    app.use(koa_cookie_1.default());
};
