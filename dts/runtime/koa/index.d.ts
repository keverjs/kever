import * as Koa from 'koa';
import { RuntimeOptionsInterface } from '../../interface';
declare function KoaRuntime(controllers: Set<any>, options: RuntimeOptionsInterface): Koa<Koa.DefaultState, Koa.DefaultContext>;
export default KoaRuntime;
