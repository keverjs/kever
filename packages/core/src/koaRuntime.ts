import Koa, { Middleware } from 'koa'
import { parseRouter, ControllerMetaType } from '@kever/router'
import { getGlobalPlugin } from '@kever/ioc'

export const koaRuntime = (
  controllers: Set<ControllerMetaType>,
  koaPlugin: Middleware[]
) => {
  const router = parseRouter([...controllers])
  const globalPlugins = getGlobalPlugin()
  const plugins = [
    ...koaPlugin,
    ...globalPlugins,
    router.routes(),
    router.allowedMethods(),
  ]
  const app = new Koa()
  // install plugins
  installPlugins(app, plugins as Koa.Middleware[])

  return app
}

function installPlugins(app: Koa, plugins: Koa.Middleware[]) {
  for (const plugin of plugins) {
    app.use(plugin)
  }
}
