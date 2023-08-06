import { type Context, type KoaContext } from '@kever/shared'

export const enhanceJSON = (ctx: KoaContext): Context => {
  ctx.json = (object: Record<string, unknown>) => {
    ctx.set('Content-type', 'application/json')
    ctx.body = object
  }
  return ctx as Context
}
