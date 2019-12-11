import { RuntimeOptionsInterface } from '../interface';
import * as Koa from 'koa';
export declare const createApplication: (options?: RuntimeOptionsInterface) => Koa<Koa.DefaultState, Koa.DefaultContext>;
export declare const Controller: (path?: string) => Function;
