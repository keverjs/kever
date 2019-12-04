import * as Koa from 'koa'
import * as Router from 'koa-router'
import { RuntimeOptionsInterface, RouteMetaInterface } from '../../interface'
import { META_ROUTER } from '../../constants'
import { resolvePath } from '../../utils'

function KoaRuntime(controllers: Set<any>, options: RuntimeOptionsInterface) {
  const app: Koa = new Koa()
  const router: Router = new Router()
  const plugins: Array<Koa.Middleware> = options.plugins || []
  if (plugins.length) {
    for (let plugin of plugins) {
      app.use(plugin)
    }
  }
  for (let controllerMeta of controllers) {
    const { path: rootPath, controller } = controllerMeta
    if (!rootPath) {
      throw new Error('this class is not controller')
    }
    Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
      .filter(name => name !== 'constructor')
      .forEach(name => {
        const metaRoute: RouteMetaInterface = Reflect.getMetadata(
          META_ROUTER,
          controller[name]
        )
        if (metaRoute) {
          const { methods, path, beforePlugins, afterPlugins } = metaRoute
          const routePath: string = resolvePath(rootPath, path)
          for (let method of methods) {
            router[method](
              routePath,
              ...beforePlugins,
              async (ctx: Koa.Context, next: Koa.Next) => {
                // TODO
                await controller[name](ctx, next)
              },
              ...afterPlugins
            )
          }
        }
      })
  }
  app.use(router.routes()).use(router.allowedMethods())
  return app
}

export default KoaRuntime
