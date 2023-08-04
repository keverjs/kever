import type { Logger } from '@kever/core'
import { getMetadataStore, type Context, type KoaContext, META_LOGGER } from '@kever/shared'

export const enhanceLogger = (ctx: KoaContext): Context => {
  const logger = getMetadataStore<Logger>(META_LOGGER)
  ctx.logger = logger
  return ctx as Context
}
