export interface RuntimeOptions {
    plugins?: Array<Function>;
}
export interface InstanceMeta {
    key: symbol;
    value: (new () => {});
}
export interface RouteAop {
    before?: Array<Function>;
    after?: Array<Function>;
}
