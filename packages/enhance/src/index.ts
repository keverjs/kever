import type { KeverMiddleware, KoaContext, KoaNext } from '@kever/shared'

import { enhanceContext } from './context'
import './context/declare'

export const enhanceMiddleware = (middlewares: KeverMiddleware[]) => {
  return middlewares.map(md => (ctx: KoaContext, next: KoaNext) => {
    const context = enhanceContext(ctx)
    return md(context, next)
  })
}
