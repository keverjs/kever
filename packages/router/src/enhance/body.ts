import { type Context, type KoaContext } from '@kever/shared'

export const enhanceBody = (ctx: KoaContext): Context => {
  ctx.getBody = <T>(key?: string): T | undefined => {
    if (ctx.request.method === 'post' && ctx.body) {
      if (key) {
        return (ctx.body as Record<string, unknown>)[key] as T
      }
      return ctx.body as T
    }
    return undefined
  }
  return ctx as Context
}
