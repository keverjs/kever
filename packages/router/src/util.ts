export const getInstanceMethods = <T extends object>(instance: T): string[] => {
  return Object.getOwnPropertyNames(Object.getPrototypeOf(instance)).filter(
    (name) => typeof instance[name as keyof T] === 'function'
  )
}

export const resolvePath = (rootPath: string, path: string): string => {
  if (rootPath === '/') {
    return path
  }
  return `${rootPath}${path}`
}
