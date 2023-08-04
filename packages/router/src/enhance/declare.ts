import type { Logger } from '@kever/core'

declare module '@kever/shared' {
  export interface Context {
    logger: Logger
    getBody: <T>(key?: string) => T | undefined
    getQuery: <T>(key?: string) => T | undefined
    getHeader: (key: string) => string | undefined
    setHeader: (key: string, value: string) => void
  }
}
