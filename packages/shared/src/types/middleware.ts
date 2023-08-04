import { Context as KoaContext, Next as KoaNext } from 'koa'

export type KoaMiddleware = (context: KoaContext, next: KoaNext) => void
export {
  KoaContext,
  KoaNext
}
export interface Context extends KoaContext {}

export type Next = KoaNext

export type KeverMiddleware = (context: Context, next: Next) => void



