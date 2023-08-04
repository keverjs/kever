import { type Context, type KoaContext } from '@kever/shared'


export const enhanceBody = (ctx: KoaContext): Context => {
  ctx.getHeader = (key: string): string | undefined => {
    return ctx.header[key] as string | undefined
  }
  ctx.setHeader = (key: string, value: string) => {
    ctx.header[key] = value
  }
  return ctx as Context
}
