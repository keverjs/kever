export const getInstanceMethods = <T extends object>(instance: T): string[] => {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
    (name) => typeof instance[name as keyof T] === 'function'
  )
}
