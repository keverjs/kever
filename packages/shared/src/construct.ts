export const instancePool = new Map<Object, Object>()

export const construct = (target: Function, params: unknown[] = []) => {
  const instance = Reflect.construct(target, params)
  instancePool.set(target.prototype, instance)
  return instance
}

export const defineProperty = (
  target: Object,
  propertyKey: PropertyKey,
  value: unknown
) => {
  const instance = instancePool.get(target)

  Object.defineProperty(instance ? instance : target, propertyKey, {
    value,
    writable: false,
    enumerable: false,
  })
}
