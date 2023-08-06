export * from './metadata'
export * from './middleware'

export type Instance = new (...args: unknown[]) => unknown

export type Tag = string | symbol
