import { type Context, type KoaContext } from '@kever/shared'

interface ConsideredRequest {
  method: string
  body: Record<string, unknown> | undefined
}

export const enhanceBody = (ctx: KoaContext): Context => {
  ctx.getBody = <T>(key?: string): T | undefined => {
    ctx.header
    const { method, body } = ctx.request as unknown as ConsideredRequest
    if (method === 'post' && body) {
      if (key) {
        return body[key] as T
      }
      return body as T
    }
    return undefined
  }
  return ctx as Context
}
