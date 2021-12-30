import * as Koa from 'koa'
import { Middleware } from 'koa'
import { ControllerMetaType } from '@kever/router'
import { logger } from '@kever/logger'
import { construct } from '@kever/ioc'
import { controllerPoll } from './controller'
import { koaRuntime } from './koaRuntime'
import { loadModules } from './loadModules'
import { initEvent } from './handler'
import { fillLine, getAppVersion, getCurrentProjectName } from './utils'
import chalk from 'chalk'

interface AppOption {
  host?: string
  port?: number
  middlewares?: (string | Middleware)[]
  modulePath?: []
  env?: string
  tsconfig?: string
}

const DEFAULT_OPTION = {
  host: '127.0.0.1',
  port: 8080,
  middlewares: [],
  modulePath: [],
  env: 'development',
  tsconfig: 'tsconfig.json',
}

type Callback = (app: Koa) => void
export const createApp = async (options: AppOption, callback?: Callback) => {
  try {
    const finalOptions = mergeDefaultOptions(options)
    let koaMiddleware: Middleware[] = []
    let keverMiddleware: string[] = []
    for (let i = 0; i < finalOptions.middlewares.length; i++) {
      const middleware = finalOptions.middlewares[i]
      if (typeof middleware === 'string') {
        keverMiddleware.push(middleware)
      } else {
        koaMiddleware.push(middleware)
      }
    }
    // loadModules
    await loadModules(
      keverMiddleware,
      finalOptions.modulePath,
      finalOptions.env,
      finalOptions.tsconfig
    )

    const constrollers = new Set<ControllerMetaType>()

    for (let [path, constructor] of controllerPoll.entries()) {
      const controller = construct(constructor, [])
      constrollers.add({ path, controller })
    }

    const app = koaRuntime(constrollers, koaMiddleware)

    const server = app.listen(finalOptions.port, finalOptions.host, () => {
      callback && callback(app)
      if (finalOptions.env === 'development') {
        outputSetupStatus(finalOptions, constrollers)
      }
    })
    initEvent(server)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}

function mergeDefaultOptions(options: AppOption = {}): Required<AppOption> {
  return Object.assign({}, DEFAULT_OPTION, options)
}

async function outputSetupStatus(
  options: AppOption,
  controllers: Set<ControllerMetaType>
) {
  try {
    const [projectName, version] = await Promise.all([
      getCurrentProjectName(),
      getAppVersion(),
    ])
    const projectNameLine = fillLine(chalk.magenta(projectName))
    const versionLine = fillLine(chalk.magenta(`Kever v${version}`))
    const hostLine = fillLine([
      [chalk.gray('Host'), chalk.blue(String(options.host))],
      [chalk.gray('Port'), chalk.blue(String(options.port))],
    ])

    const handlerAndPid = fillLine([
      [chalk.gray('Handlers'), chalk.blue(String(controllers.size))],
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
