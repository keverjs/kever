import * as Koa from 'koa'
import { controllerPoll } from './controllerDecorator'
import { koaRuntime } from '../koaRuntime'
import { ControllerMetaType } from '@kever/router'
import { logger } from '@kever/logger'
import { loadModules } from '../loadModules'

export interface OptionsType {
  hostname?: string
  port?: number
  plugins?: string[]
  env?: string
  tsconfig?: string
}
type CreateApplicationType = (
  options?: OptionsType,
  callback?: (app: Koa) => void
) => Promise<void>
type NewConstructorType = new (...args: any[]) => any

const DEFAULT_OPTIONS = {
  hostname: '127.0.0.1',
  port: 8080,
  plugins: [],
  env: 'development',
  tsconfig: 'tsconfig.json',
}

export const createApplication: CreateApplicationType = async (
  options = {},
  callback
) => {
  try {
    const processOptions = _handleOptions(options)
    // loadModules
    logger.info('✅...load file...')
    await loadModules(
      processOptions.plugins,
      processOptions.env,
      processOptions.tsconfig
    )
    logger.info('✅...load file done...')
    const constrollers = new Set<ControllerMetaType>()
    for (let [path, constructor] of controllerPoll.entries()) {
      const controller = new (constructor as NewConstructorType)()
      constrollers.add({ path, controller })
    }
    const app = koaRuntime(constrollers)
    app.on('error', (error) => {
      logger.error(error)
    })
    app.listen(processOptions.port, processOptions.hostname, () => {
      logger.info(
        `server listening http://${processOptions.hostname}:${processOptions.port}`
      )
      logger.info('server is running...')
      callback && callback(app)
    })
  } catch (err) {
    logger.error(err)
  }
}

function _handleOptions(options: OptionsType): Required<OptionsType> {
  const processOptions = Object.assign({}, DEFAULT_OPTIONS, options)
  return processOptions
}
