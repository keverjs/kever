import type { Context, KoaContext } from '@kever/shared'

import { 
  enhanceLogger,
  enhanceQuery,
  enhanceBody,
  enhanceHTML,
  enhanceJSON
} from './handers'

type EnhanceFn = (ctx: KoaContext) => Context
const enhance = (fn: EnhanceFn[]) => (ctx: KoaContext): Context => {
  return fn.reduce((ctx, fn) => fn(ctx), ctx) as Context
}

export const enhanceContext = (ctx: KoaContext): Context => {
  const context = enhance([
    enhanceLogger,
    enhanceQuery,
    enhanceBody,
    enhanceHTML,
    enhanceJSON
  ])(ctx)
  return context
}
