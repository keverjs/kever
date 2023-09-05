import type { Logger } from '@kever/core'

declare module '@kever/shared' {
  export interface Context {
    logger: Logger
    getBody: <T>(key?: string) => T | undefined
    getQuery: <T>(key?: string) => T | undefined
    getParams:<T>(key?: string) => T | undefined
    html: (string: string) => void
    json: (object: Record<string, unknown>) => void
  }
}
