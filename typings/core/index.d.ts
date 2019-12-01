import { RuntimeOptions } from '../interface';
import * as Koa from 'koa';
export declare const createApplication: (options?: RuntimeOptions) => Koa<Koa.DefaultState, Koa.DefaultContext>;
export declare const Controller: (path?: string) => <T extends new (...args: any[]) => {}>(constructor: T) => T;
