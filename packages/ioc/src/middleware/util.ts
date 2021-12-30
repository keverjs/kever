import { InstancePool, Tag } from '../instancePool'
import { Context, Next } from 'koa'

export const enum MType {
  Global,
  Router,
  Property,
}

export type KoaMiddleware = (context: Context, next: Next) => void

type BaseMiddlewareReadyParams<T> = T extends MType.Property
  ? []
  : T extends MType.Router
  ? [KoaMiddleware, unknown]
  : T extends MType.Global
  ? [Context, Next]
  : never

type BaseMiddlewareReadyReturn<T> = T extends MType.Property
  ? unknown | Promise<unknown>
  : T extends MType.Router
  ? KoaMiddleware
  : T extends MType.Global
  ? void
  : never

export interface BaseMiddleware<T extends MType> {
  ready(...args: BaseMiddlewareReadyParams<T>): BaseMiddlewareReadyReturn<T>
  destory?: () => void
}

export const enum Aop {
  Before,
  After,
  Duplex,
}

export interface GolbalMiddlewareMeta {
  type: MType.Global
  instance: BaseMiddleware<MType.Global>
}
export interface RouterMiddlewareMeta {
  type: MType.Router
  instance: BaseMiddleware<MType.Router>
}
export interface PropertyMiddlewareMeta {
  type: MType.Property
  instance: BaseMiddleware<MType.Property>
  payload: unknown
}

export const middlewarePool = new InstancePool<
  Tag,
  GolbalMiddlewareMeta | RouterMiddlewareMeta | PropertyMiddlewareMeta
>()

interface RouterAopInfo {
  [Aop.After]: Set<KoaMiddleware>
  [Aop.Before]: Set<KoaMiddleware>
  propertyKey: Tag
  target: Object
}

export const routerPool = new InstancePool<string, RouterAopInfo>()

export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
