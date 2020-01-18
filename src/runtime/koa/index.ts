import * as Koa from 'koa'
import * as Router from 'koa-router'
import { installMiddleware } from './middleware'
import parseParamsDecorator from './params'
import { RuntimeOptions, RouteMetaInterface } from '../../types'
import { META_ROUTER } from '../../constants'
import { resolvePath } from '../../utils'

/**
 * @description 注册中间件调用koa启动服务
 * @param controllers
 * @param options
 */
function KoaRuntime(controllers: Set<any>, options: RuntimeOptions) {
  const app: Koa = new Koa()
  const router: Router = new Router()
  const plugins: Array<Koa.Middleware> = options.plugins || []
  // 注册中间件
  installMiddleware(app, plugins)
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
                // 将ctx和next绑定到controller实例上
                controller['ctx'] = ctx
                controller['next'] = next
                // 解析参数装饰器
                const routeParams = parseParamsDecorator(controller[name], ctx)
                await controller[name](...routeParams)
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
