import type * as Koa from 'koa'
import type { Middleware } from 'koa'
import chalk from 'chalk'
import type { ControllerMeta } from '@kever/shared'
import { construct, fillLine, getAppVersion, getProjectName, setMetadataStore, META_LOGGER } from '@kever/shared'
import { controllerPool } from './controller'
import { koaRuntime } from './koaRuntime'
import { loadModules } from './loadModules'
import { initEvent } from './handler'
import { defaultLogger, type Logger } from './logger'

/**
 * app env
 */
export const enum Env {
  DEV = 'development',
  PROD = 'production'
}

/**
 * app
 */
export interface App extends Koa {
  options: Required<AppOptions>
}

/**
 * Kever app option
 */
export interface AppOptions {
  /**
   * http host, default is 127.0.0.1
   */
  host?: string
  /**
   * http port, default is 8080
   */
  port?: number
  /**
   * koa or kever middlewares
   */
  middlewares?: (string | Middleware)[]
  /**
   * auto load modules file path
   */
  modulePath?: []
  /**
   * app env, default is development
   */
  env?: Env
  /**
   * tsoncifg file path, default is root tsconfig file
   */
  tsconfig?: string
  /**
   * custom logger, default is console
   */
  logger?: Logger
}

const DEFAULT_OPTION: Required<AppOptions> = {
  host: '127.0.0.1',
  port: 8080,
  middlewares: [],
  modulePath: [],
  env: Env.DEV,
  tsconfig: 'tsconfig.json',
  logger: defaultLogger,
}

type Callback = (app: App) => void

/**
 * create Kever App
 * @param options 
 * @param callback 
 */
export const createApp = async (options: AppOptions, callback?: Callback) => {
  const opts = mergeOptions(options)
  setMetadataStore(META_LOGGER, opts.logger)
  const [koaMiddle, keverMiddle] = categorizeMiddleware(opts.middlewares)

  try {
    // loadModules
    await loadModules(keverMiddle, opts)

    const constrollers = new Set<ControllerMeta>()
    for (let [path, constructor] of controllerPool.entries()) {
      const controller = construct(constructor, [])
      constrollers.add({ path, controller })
    }

    const app = koaRuntime(opts, constrollers, koaMiddle)

    const server = app.listen(opts.port, opts.host, () => {
      callback && callback(app)
      if (opts.env === Env.DEV) {
        outputStartupStatus(opts, constrollers)
      }
    })
    initEvent(app, server)
  } catch (err) {
    opts.logger.error(`${err.message} \n ${err.stack}`)
  }
}

const categorizeMiddleware = (middlewares: (string | Middleware)[]): [Middleware[], string[]] => {
  let koa: Middleware[] = []
  let kever: string[] = []
  for (let i = 0; i < middlewares.length; i++) {
    const middleware = middlewares[i]
    if (typeof middleware === 'string') {
      kever.push(middleware)
    } else {
      koa.push(middleware)
    }
  }
  return [koa, kever]
}

const mergeOptions = (options: AppOptions = {}): Required<AppOptions> =>
  Object.assign({}, DEFAULT_OPTION, options)

const outputStartupStatus = async (options: AppOptions, controllers: Set<ControllerMeta>) => {
  try {
    const [projectName, version] = await Promise.all([getProjectName(), getAppVersion()])
    const projectNameLine = fillLine(chalk.magenta(projectName))
    const versionLine = fillLine(chalk.magenta(`Kever v${version}`))
    const hostLine = fillLine([
      [chalk.gray('Host'), chalk.blue(String(options.host))],
      [chalk.gray('Port'), chalk.blue(String(options.port))],
    ])

    const handlerAndPid = fillLine([
      [chalk.gray('Controllers'), chalk.blue(String(controllers.size))],
      [chalk.gray('PID'), chalk.blue(String(process.pid))],
    ])
    console.log(`
    ┌───────────────────────────────────────────────────┐ 
    │ ${projectNameLine} │
    │ ${versionLine} │
    │                                                   │
    │ ${hostLine} │
    │ ${handlerAndPid} │
    └───────────────────────────────────────────────────┘ 
    `)
  } catch (_) {}
}
