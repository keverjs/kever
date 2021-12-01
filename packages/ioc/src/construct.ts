import { InstancePool, Tag } from './instancePool'
export const propertyPool = new InstancePool<string, Map<Tag, unknown>>()

const createConstruct = (target: Function, params: unknown[] = []) => {
  return Reflect.construct(target, params)
}

const injectProperty = (target: Object) => {
  const poolKey = target.constructor.name
  const pool = propertyPool.use(poolKey)
  if (typeof pool === 'boolean') {
    propertyPool.on(poolKey, (pool) => {
      injectPropertyHandler(target, pool)
    })
    return
  }
  injectPropertyHandler(target, pool)
}

const injectPropertyHandler = (target: Object, pool: Map<Tag, unknown>) => {
  for (let [key, value] of pool.entries()) {
    Object.defineProperty(target, key, {
      value,
      writable: false,
      enumerable: false,
    })
  }
}

const constructInjectProperty = (target: Function, params: unknown[]) => {
  const instance = createConstruct(target, params)
  injectProperty(instance)
  return instance
}

export const construct = constructInjectProperty
