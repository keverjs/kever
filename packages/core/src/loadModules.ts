import { resolve } from 'path'
import { glob } from 'glob'
import { loadModule } from '@kever/shared'
import { type AppOptions } from './application'

export const loadModules = async (middlewares: string[], options: Required<AppOptions>) => {
  const { include, logger } = options
  try {
    const modulesPath = (await Promise.all(include.map(p => getFiles(p))))
      .reduce((paths, p) => [...p, ...paths],[])
      .map(p => resolve(process.cwd(), p))
    await Promise.all((modulesPath.concat(middlewares)).map((path) => loadModule(path, logger)))
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}

const getFiles = (pattern: string): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    glob(pattern, (err, matches) => {
      if (err) {
        reject(err)
      }
      resolve(matches)
    })
  })
}
