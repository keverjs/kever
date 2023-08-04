export * from './metadata'
export * from './middleware'

export type Instance = new (...args: any[]) => any

export type Tag = string | symbol
