import { glob } from 'glob'
import { loadModule } from '@kever/shared'
import { type AppOptions } from './application'

export const loadModules = async (middlewares: string[], options: Required<AppOptions>) => {
  const { exclude, include, logger } = options
  try {
    const moduleFiles = await glob(include, {
      ignore: exclude
    })
    await Promise.all((moduleFiles.concat(middlewares)).map((path) => loadModule(path, logger)))
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}
