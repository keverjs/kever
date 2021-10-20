import { InstancePool, Tag } from './instancePool'
export const propertyPool = new InstancePool<string, Map<Tag, unknown>>()

const createConstruct = (target: Function, params: unknown[] = []) => {
  return Reflect.construct(target, params)
}

const injectProperty = (target: Object) => {
  const poolKey = target.constructor.name
  const pool = propertyPool.use(poolKey)
  if (typeof pool === 'boolean') {
    return target
  }
  for (let [key, value] of pool.entries()) {
    Object.defineProperty(target, key, {
      value,
      writable: false,
      enumerable: false,
    })
  }
}

export const constructInjectProperty = (
  target: Function,
  params: unknown[]
) => {
  const instance = createConstruct(target, params)
  injectProperty(instance)
  return instance
}
