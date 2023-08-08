import { resolve } from 'node:path'
import { glob } from 'glob'
import { loadModule } from '@kever/shared'
import { type AppOptions } from './application'

export const loadModules = async (middlewares: string[], options: Required<AppOptions>) => {
  const { exclude, include, logger } = options
  try {
    const modulesPath = (await glob(include, { ignore: exclude })).map(path => resolve(process.cwd(), path))
    await Promise.all((modulesPath.concat(middlewares)).map((path) => loadModule(path, logger)))
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}
