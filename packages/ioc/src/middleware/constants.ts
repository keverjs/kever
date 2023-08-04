import type { Context, Next } from 'koa'

export const enum MType {
  Global,
  Route,
  Property,
}

export type KoaMiddleware = (context: Context, next: Next) => void

type BaseMiddlewareReadyParams<T> = T extends MType.Property
  ? []
  : T extends MType.Route
  ? [KoaMiddleware, unknown]
  : T extends MType.Global
  ? [Context, Next]
  : never

type BaseMiddlewareReadyReturn<T> = T extends MType.Property
  ? unknown | Promise<unknown>
  : T extends MType.Route
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
