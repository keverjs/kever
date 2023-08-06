import type { Context, KeverMiddleware, KoaContext, KoaNext } from '@kever/shared'
import { enhanceLogger } from './logger'
import { enhanceQuery } from './query'
import { enhanceBody } from './body'
import { enhanceHTML } from './html'
import { enhanceJSON } from './json'

export const enhanceMiddleware = (middlewares: KeverMiddleware[]) => {
  return middlewares.map(md => (ctx: KoaContext, next: KoaNext) => {
    const context = enhanceContext(ctx)
    return md(context, next)
  })
}

type EnhanceFn = (ctx: KoaContext) => Context
const enhance = (fn: EnhanceFn[]) => (ctx: KoaContext): Context => {
  return fn.reduce((ctx, fn) => fn(ctx), ctx) as Context
}

const enhanceContext = (ctx: KoaContext): Context => {
  const context = enhance([
    enhanceLogger,
    enhanceQuery,
    enhanceBody,
    enhanceHTML,
    enhanceJSON
  ])(ctx)
  return context
}
