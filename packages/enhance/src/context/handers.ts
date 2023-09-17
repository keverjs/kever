import type { Logger } from '@kever/core'
import { getMetadataStore, type Context, type KoaContext, META_LOGGER } from '@kever/shared'

interface ConsideredRequest {
  method: string
  body: Record<string, unknown> | undefined
}
/**
 * enhance context getBody methods
 * @param ctx 
 * @returns 
 */
export const enhanceBody = (ctx: KoaContext): Context => {
  ctx.getBody = <T>(key?: string): T | undefined => {
    const { body } = ctx.request as unknown as ConsideredRequest
    if (body) {
      if (key) {
        return body[key] as T
      }
      return body as T
    }
    return undefined
  }
  return ctx as Context
}

/**
 * enhance context getQuery methods
 * @param ctx 
 * @returns 
 */
export const enhanceQuery = (ctx: KoaContext): Context => {
  ctx.getQuery = (key?: string) => {
    if (key) {
      return ctx.query[key]
    }
    return ctx.query
  }
  return ctx as Context
}

export const enhanceParams = (ctx: KoaContext): Context => {
  ctx.getParams = <T>(key?: string) => {
    const params = ctx.params || {}
    if (key) {
      return params[key]
    }
    return params as T
  }
  return ctx as Context
}

/**
 * enhance context logger
 * @param ctx 
 * @returns 
 */
export const enhanceLogger = (ctx: KoaContext): Context => {
  const logger = getMetadataStore<Logger>(META_LOGGER)
  ctx.logger = logger
  return ctx as Context
}

/**
 * enhance context html methods
 * @param ctx 
 * @returns 
 */
export const enhanceHTML = (ctx: KoaContext): Context => {
  ctx.html = (string: string) => {
    ctx.set('Content-type', 'text/html')
    ctx.body = string
  }
  return ctx as Context
}
/**
 * enhance context json methods
 * @param ctx 
 * @returns 
 */
export const enhanceJSON = (ctx: KoaContext): Context => {
  ctx.json = (object: Record<string, unknown>) => {
    ctx.set('Content-type', 'application/json')
    ctx.body = object
  }
  return ctx as Context
}
