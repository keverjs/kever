import type { KeverMiddleware, Context, Next } from '@kever/shared'

export const enum MType {
  Global,
  Route,
  Property,
}

type BaseMiddlewareReadyParams<T> = T extends MType.Property
  ? []
  : T extends MType.Route
  ? [KeverMiddleware, unknown]
  : T extends MType.Global
  ? [Context, Next]
  : never

type BaseMiddlewareReadyReturn<T> = T extends MType.Property
  ? unknown | Promise<unknown>
  : T extends MType.Route
  ? KeverMiddleware
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
