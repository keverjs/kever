import { type Context, type KoaContext } from '@kever/shared'

export const enhanceHTML = (ctx: KoaContext): Context => {
  ctx.html = (string: string) => {
    ctx.set('Content-type', 'text/html')
    ctx.body = string
  }
  return ctx as Context
}
