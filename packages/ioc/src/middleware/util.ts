import { InstancePool, Tag } from '../instancePool'
import { Context, Next } from 'koa'

export const enum Type {
  Global,
  Router,
  Property,
}

export type KoaMiddleware = (context: Context, next: Next) => void

type BaseMiddlewareReadyParams<T> = T extends Type.Property
  ? []
  : T extends Type.Router
  ? [KoaMiddleware, unknown]
  : T extends Type.Global
  ? [Context, Next]
  : never

type BaseMiddlewareReadyReturn<T> = T extends Type.Property
  ? unknown | Promise<unknown>
  : T extends Type.Router
  ? KoaMiddleware
  : T extends Type.Global
  ? void
  : never

export interface BaseMiddleware<T extends Type> {
  ready(...args: BaseMiddlewareReadyParams<T>): BaseMiddlewareReadyReturn<T>
  destory?: () => void
}

export const enum Aop {
  Before,
  After,
  Duplex,
}

export interface GolbalMiddlewareMeta {
  type: Type.Global
  instance: BaseMiddleware<Type.Global>
}
export interface RouterMiddlewareMeta {
  type: Type.Router
  instance: BaseMiddleware<Type.Router>
}
export interface PropertyMiddlewareMeta {
  type: Type.Property
  instance: BaseMiddleware<Type.Property>
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
