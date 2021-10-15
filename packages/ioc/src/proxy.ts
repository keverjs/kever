import { Tag } from './instancePool'

interface Ioc {
  target: Object
  propertyKey: Tag
  payload: unknown
}
export const iocPool = new Set<Ioc>()

export const toProxyInstance = (controller: Object) => {
  const iocs = [...iocPool].filter(
    (ioc) => ioc.target === Object.getPrototypeOf(controller)
  )
  return new Proxy(controller, {
    get(target, propertyKey: string, receiver) {
      // 约定获取属性的原始值，原因是获取路由Meta需要用到原函数
      if (propertyKey[0] === '_') {
        return Reflect.get(target, propertyKey.slice(1), receiver)
      }

      if (Array.isArray(iocs)) {
        const ioc = iocs.find((ioc) => ioc.propertyKey === propertyKey)
        if (ioc) {
          return ioc.payload
        }
      }

      return Reflect.get(target, propertyKey, receiver)
    },
  })
}
