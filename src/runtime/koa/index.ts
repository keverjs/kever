import * as Koa from 'koa'
import * as Router from 'koa-router'
import { installMiddleware, middlePoll } from './middleware/index'
import parseParamsDecorator from './params'
import { RuntimeOptions, RouteMetaInterface } from '../../types'
import { META_ROUTER } from '../../constants'
import { resolvePath } from '../../utils'
const Logger = console
/**
 * @description 注册中间件调用koa启动服务
 * @param controllers
 * @param options
 */
function KoaRuntime(controllers: Set<any>, options: RuntimeOptions) {
  const app: Koa = new Koa()
  const router: Router = new Router()
  // 注册全局中间件
  let globalMiddles: Set<Koa.Middleware> = new Set()
  for (let globalMiddle of middlePoll.globalMiddle.values()) {
    globalMiddles.add(globalMiddle)
  }
  installMiddleware(app, globalMiddles)
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
          const {
            methods,
            path,
            beforeMiddlesType,
            afterMiddlesType
          } = metaRoute
          const beforeMiddles = beforeMiddlesType.map(middleType => {
            if (middlePoll.routeMiddle.has(middleType)) {
              return middlePoll.routeMiddle.get(middleType)
            } else {
              Logger.error(`[kever|err]: ${String(middleType)} unregistered！`)
            }
          })
          const afterMiddles = afterMiddlesType.map(middleType => {
            if (middlePoll.routeMiddle.has(middleType)) {
              return middlePoll.routeMiddle.get(middleType)
            } else {
              Logger.error(`[kever|err]: ${String(middleType)} unregistered！`)
            }
          })
          const routePath: string = resolvePath(rootPath, path)
          for (let method of methods) {
            router[method](
              routePath,
              ...beforeMiddles,
              async (ctx: Koa.Context, next: Koa.Next) => {
                // 将ctx和next绑定到controller实例上
                controller['ctx'] = ctx
                controller['next'] = next
                // 解析参数装饰器
                const routeParams = parseParamsDecorator(controller[name], ctx)
                await controller[name](...routeParams)
              },
              ...afterMiddles
            )
          }
        }
      })
  }
  app.use(router.routes()).use(router.allowedMethods())
  return app
}

export default KoaRuntime
