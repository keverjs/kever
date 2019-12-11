import * as Koa from 'koa';
export default class BaseController extends Koa {
    ctx: Koa.Context;
    next: Koa.Next;
    _isExtends: symbol;
}
