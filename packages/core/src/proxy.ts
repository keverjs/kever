import { iocPool } from '@kever/ioc'

export const controllersToproxy = (controller: Object) => {
  const iocs = [...iocPool].filter(
    (ioc) => ioc.target === Object.getPrototypeOf(controller)
  )
  if (!Array.isArray(iocs) || !iocs.length) {
    return controller
  }
  return new Proxy(controller, {
    get(target, propertyKey, receiver) {
      const ioc = iocs.find((ioc) => ioc.propertyKey === propertyKey)
      if (ioc) {
        return ioc.payload
      }
      return Reflect.get(target, propertyKey, receiver)
    },
  })
}
