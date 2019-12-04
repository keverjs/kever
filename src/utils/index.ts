/**
 *
 * @param rootPath
 * @param path
 */
export const resolvePath = (rootPath: string, path: string): string => {
  if (rootPath === '/') {
    return path
  }
  return `${rootPath}${path}`
}
