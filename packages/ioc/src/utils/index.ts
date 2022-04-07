export const construct = (target: Function, params: unknown[] = []) => {
  return Reflect.construct(target, params)
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

export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
