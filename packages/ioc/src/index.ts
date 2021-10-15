import { Tag } from './instancePool'

interface Ioc {
  target: Object
  propertyKey: Tag
  payload: unknown
}
export const iocPool = new Set<Ioc>()

export * from './decorator'
export * from './plugin'
export * from './model'
