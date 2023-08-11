import Koa, { Middleware } from 'koa'
import bodyparser from 'koa-bodyparser'
import { parseRouter } from '@kever/router'
import { getGlobalMiddleware } from '@kever/ioc'
import { type ControllerMeta} from '@kever/shared'
import type { AppOptions, App } from './application'

export const koaRuntime = (opts: Required<AppOptions>, controllerMetas: Set<ControllerMeta>, koaMiddleware: Middleware[]) => {
  const app = new Koa() as App
  app.options = opts

  const router = parseRouter(controllerMetas)

  const globalMiddlewares = getGlobalMiddleware();
  const middlewares = [
    bodyparser(opts.bodyparser),
    ...koaMiddleware,
    ...globalMiddlewares,
    router.routes(),
    router.allowedMethods(),
  ]

  // install middlewares
  installMiddlewares(app, middlewares as Koa.Middleware[])

  return app
}

function installMiddlewares(app: Koa, middlewares: Koa.Middleware[]) {
  for (const middleware of middlewares) {
    app.use(middleware)
  }
}
