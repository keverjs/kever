import * as Koa from 'koa';
import { RuntimeOptions } from '../../interface';
declare function KoaRuntime(controllers: Set<any>, options: RuntimeOptions): Koa<Koa.DefaultState, Koa.DefaultContext>;
export default KoaRuntime;
