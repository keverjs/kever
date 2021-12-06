import * as Koa from 'koa'
import { Middleware } from 'koa'
import { ControllerMetaType } from '@kever/router'
import { logger } from '@kever/logger'
import { construct } from '@kever/ioc'
import { controllerPoll } from './controller'
import { koaRuntime } from './koaRuntime'
import { loadModules } from './loadModules'
import { initEvent } from './handler'

interface AppOption {
  hostname?: string
  port?: number
  middlewares?: (string | Middleware)[]
  env?: string
  tsconfig?: string
}

const DEFAULT_OPTION = {
  hostname: '127.0.0.1',
  port: 8080,
  middlewares: [],
  env: 'development',
  tsconfig: 'tsconfig.json',
}

type Callback = (app: Koa) => void
export const createApp = async (options: AppOption, callback?: Callback) => {
  try {
    const processOptions = _handleOptions(options)
    let koaMiddleware: Middleware[] = []
    let keverMiddleware: string[] = []
    for (let i = 0; i < processOptions.middlewares.length; i++) {
      const middleware = processOptions.middlewares[i]
      if (typeof middleware === 'string') {
        keverMiddleware.push(middleware)
      } else {
        koaMiddleware.push(middleware)
      }
    }
    // loadModules
    logger.info('✅...load file...')
    await loadModules(
      keverMiddleware,
      processOptions.env,
      processOptions.tsconfig
    )
    logger.info('✅...load file done...')

    const constrollers = new Set<ControllerMetaType>()

    for (let [path, constructor] of controllerPoll.entries()) {
      const controller = construct(constructor, [])
      constrollers.add({ path, controller })
    }

    const app = koaRuntime(constrollers, koaMiddleware)

    const server = app.listen(
      processOptions.port,
      processOptions.hostname,
      () => {
        logger.info(
          `server listening http://${processOptions.hostname}:${processOptions.port}`
        )
        logger.info('server is running...')
        callback && callback(app)
      }
    )
    initEvent(server)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}

function _handleOptions(options: AppOption = {}): Required<AppOption> {
  return Object.assign({}, DEFAULT_OPTION, options)
}
