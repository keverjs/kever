import { type Context, type KoaContext } from '@kever/shared'

export const enhanceQuery = (ctx: KoaContext): Context => {
  ctx.getQuery = (key?: string) => {
    if (key) {
      return ctx.query['key']
    }
    return ctx.query
  }
  return ctx as Context
}
