export const resolvePath = (rootPath: string, path: string) => {
  if(rootPath === '/') {
    return path;
  }
  return `${rootPath}${path}`
}