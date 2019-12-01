import * as Koa from 'koa'
import * as Router from 'koa-router'
import { RuntimeOptions } from '../../interface'
import { META_CONTROLLER, META_ROUTER } from '../../constants'
import { resolvePath } from '../../utils'

function KoaRuntime(controllers: Set<any>, options: RuntimeOptions) {
  const app = new Koa()
  const router = new Router()
  const plugins: Array<Koa.Middleware> = options.plugins || []
  if (plugins.length) {
    for (let plugin of plugins) {
      app.use(plugin)
    }
  }
  for (let controller of controllers) {
    const rootPath = Reflect.getMetadata(
      META_CONTROLLER,
      controller.constructor
    )
    if (!rootPath) {
      throw new Error('this class is not controller')
    }
    Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
      .filter(name => name !== 'constructor')
      .forEach(name => {
        const metaRoute = Reflect.getMetadata(META_ROUTER, controller[name])
        if (metaRoute) {
          const { methods, path, beforePlugins, afterPlugins } = metaRoute
          const routePath = resolvePath(rootPath, path)
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
