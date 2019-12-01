import { Middleware } from 'koa';
export interface RuntimeOptions {
    plugins?: Array<Middleware>;
}
export interface InstanceMeta {
    key: symbol;
    value: new () => {};
}
export interface RouteAop {
    before?: Array<Middleware>;
    after?: Array<Middleware>;
}
