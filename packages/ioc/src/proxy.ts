import { InstancePool, Tag } from './instancePool'
export const propertyPool = new InstancePool<string, Map<Tag, unknown>>()

export const toProxyInstance = (target: Object) => {
  const poolKey = target.constructor.name
  const pool = propertyPool.use(poolKey)
  if (typeof pool === 'boolean') {
    return target
  }

  return new Proxy(target, {
    get(target, propertyKey, receiver) {
      const propertyValue = pool.get(propertyKey)
      if (propertyValue) {
        return propertyValue
      }
      return Reflect.get(target, propertyKey, receiver)
    },
  })
}
