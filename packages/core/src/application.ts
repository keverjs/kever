import type * as Koa from 'koa'
import type { Middleware } from 'koa'
import chalk from 'chalk'
import type { ControllerMeta } from '@kever/shared'
import { fillLine, getAppVersion, getProjectName, setMetadataStore, META_LOGGER } from '@kever/shared'
import { getControllerMetas } from './controller'
import { koaRuntime } from './koaRuntime'
import { loadModules } from './loadModules'
import { initEvent } from './handler'
import { defaultLogger, type Logger } from './logger'
import { getMiddlewaresNum, getInjectableNum } from '@kever/ioc'

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
   * Auto load modules file path，follow the glob npm package rules.
   * By default it will include ['src/app/**\/*.{ts,js}']
   * The current working directory in which to search. Defaults to `process.cwd()`.
   * @see — https://www.npmjs.com/package/glob
   */
  include?: string[]
  /**
   * Exclude load modules file path，follow the glob npm package rules.
   * By default it will exclude ['node_modules/**'].
   * The current working directory in which to search. Defaults to `process.cwd()`.
   * @see — https://www.npmjs.com/package/glob
   */
  exclude?: string[]
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
  include: ['src/app/**/*.{ts,js}'],
  exclude: ['node_modules/**'],
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
    // 1. loadModules
    await loadModules(keverMiddle, opts)
    // 2. get controllers meta
    const controllerMetas = getControllerMetas()
    

    const app = koaRuntime(opts, controllerMetas, koaMiddle)

    const server = app.listen(opts.port, opts.host, () => {
      callback && callback(app)
      if (opts.env === Env.DEV) {
        outputStartupStatus(opts, controllerMetas)
      }
    })
    initEvent(app, server)
  } catch (err) {
    opts.logger.error(`${err.message} \n ${err.stack}`)
  }
}

const categorizeMiddleware = (middlewares: (string | Middleware)[]): [Middleware[], string[]] => {
  const koa: Middleware[] = []
  const kever: string[] = []
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

const outputStartupStatus = async (options: AppOptions, controllerMetas: Set<ControllerMeta>) => {
  try {
    const [projectName, version] = await Promise.all([getProjectName(), getAppVersion()])
    const projectNameLine = fillLine(chalk.magenta(projectName))
    const versionLine = fillLine(chalk.magenta(`Kever v${version}`))
    const apiLine = fillLine(chalk.blue(`http://${options.host}:${options.port}`))
    const hostLine = fillLine([
      [chalk.gray('Host'), chalk.blue(String(options.host))],
      [chalk.gray('Port'), chalk.blue(String(options.port))],
    ])
    const pid = fillLine([[chalk.gray('PID'), chalk.blue(String(process.pid))]])
    const controllerAndService = fillLine([
      [chalk.gray('Controllers'), chalk.blue(String(controllerMetas.size))],
      [chalk.gray('Services'), chalk.blue(String(getInjectableNum()))]
    ])
    const middlewares = fillLine([
      [chalk.gray('Middlewares'), chalk.blue(String(getMiddlewaresNum()))]
    ])
    console.log(`
    ┌───────────────────────────────────────────────────┐ 
    │ ${projectNameLine} │
    │ ${versionLine} │
    │                                                   │
    | ${apiLine} │
    |                                                   |  
    │ ${hostLine} │
    │ ${pid} │
    |                                                   |
    │ ${controllerAndService} │
    │ ${middlewares} │
    └───────────────────────────────────────────────────┘ 
    `)
  } catch (_) { /* empty */ }
}
