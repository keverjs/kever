import { Context } from 'koa'
import { Next } from 'koa'

export declare const enum Aop {
  Before = 0,
  After = 1,
  Duplex = 2,
}

export declare interface BaseMiddleware<T extends MType> {
  ready(...args: BaseMiddlewareReadyParams<T>): BaseMiddlewareReadyReturn<T>
  destory?: () => void
}

declare type BaseMiddlewareReadyParams<T> = T extends MType.Property
  ? []
  : T extends MType.Router
  ? [KoaMiddleware, unknown]
  : T extends MType.Global
  ? [Context, Next]
  : never

declare type BaseMiddlewareReadyReturn<T> = T extends MType.Property
  ? unknown | Promise<unknown>
  : T extends MType.Router
  ? KoaMiddleware
  : T extends MType.Global
  ? void
  : never

export declare const construct: (target: Function, params: unknown[]) => any

export declare const destoryAllMiddleware: () => void

export declare const getGlobalMiddleware: () => Function[]

export declare const Inject: <T>(
  tag: Tag,
  unNew?: boolean,
  param?: T | undefined
) => PropertyDecorator

export declare const Injectable: (tag: Tag) => ClassDecorator

declare class InstancePool<K, T> {
  private pool
  private listenerPool
  bind(key: K, instance: T): boolean
  unbind(key: K): boolean | T
  use(key: K): boolean | T
  getPool(): Map<K, T>
  on(key: K, listener: Listener<T>): void
  off(key: K, listener: Listener<T>): boolean
  trigger(key: K): void
}

declare type KoaMiddleware = (context: Context, next: Next) => void

declare type Listener<T> = (instance: T) => void

export declare const Middleware: {
  (tag: Tag, type: MType): ClassDecorator
  use<T, P extends MType>(
    type: P,
    param: MiddlewareUseParam<P, T>
  ): MiddlewareUseReturn<P>
}

export declare const middlewarePatch: (tag: Tag, payload: Payload) => void

declare type MiddlewareUseParam<T extends MType, U> = T extends MType.Router
  ? RouterMiddlewareParams<U>
  : Tag

declare type MiddlewareUseReturn<T extends MType> = T extends MType.Router
  ? MethodDecorator
  : PropertyDecorator

export declare const enum MType {
  Global = 0,
  Router = 1,
  Property = 2,
}

declare type Payload =
  | (() => unknown)
  | string
  | number
  | symbol
  | any[]
  | object

export declare const propertyPool: InstancePool<string, Map<Tag, unknown>>

declare interface RouterAopInfo {
  [Aop.After]: Set<KoaMiddleware>
  [Aop.Before]: Set<KoaMiddleware>
  propertyKey: Tag
  target: Object
}

declare interface RouterMiddlewareParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

export declare const routerPool: InstancePool<string, RouterAopInfo>

declare type Tag = string | symbol

export {}
