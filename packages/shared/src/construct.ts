import { Container } from './container'
import { isBoolean, isDef } from './type'

export const poolContainer = new Container<
  Object,
  Container<PropertyKey, unknown>
>()

export const construct = (target: Function, params: unknown[] = []) => {
  const instance = Reflect.construct(target, params)
  const instanceContainer = poolContainer.use(target.prototype)
  if (!isBoolean(instanceContainer)) {
    for (let [key, value] of instanceContainer.getPool().entries()) {
      if (isDef(value)) {
        defineProperty(instance, key, value)
      } else {
        instanceContainer.on(key, (inject) => {
          defineProperty(instance, key, inject)
        })
      }
    }
  }
  return instance
}

export const defineProperty = (
  target: Object,
  propertyKey: PropertyKey,
  value: unknown
) => {
  Object.defineProperty(target, propertyKey, {
    value,
    writable: false,
    enumerable: false,
  })
}
