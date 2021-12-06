import Koa, { Middleware } from 'koa'
import { parseRouter, ControllerMetaType } from '@kever/router'
import { getGlobalMiddleware } from '@kever/ioc'

export const koaRuntime = (
  controllers: Set<ControllerMetaType>,
  koaMiddleware: Middleware[]
) => {
  const router = parseRouter([...controllers])
  const globalMiddlewares = getGlobalMiddleware()
  const middlewares = [
    ...koaMiddleware,
    ...globalMiddlewares,
    router.routes(),
    router.allowedMethods(),
  ]
  const app = new Koa()
  // install middlewares
  installMiddlewares(app, middlewares as Koa.Middleware[])

  return app
}

function installMiddlewares(app: Koa, middlewares: Koa.Middleware[]) {
  for (const middleware of middlewares) {
    app.use(middleware)
  }
}
