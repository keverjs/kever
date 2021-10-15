import Router from 'koa-router'
import { Next, Context } from 'koa'
import { logger } from '@kever/logger'
import { getInstanceMethods, resolvePath } from './util'
import { META_ROUTER, RouterMetadata } from './methodsDecorator'

export interface ControllerMetaType {
  path: string
  controller: Object
}
export function parseRouter(controllerMetas: ControllerMetaType[]): Router {
  const router = new Router()
  for (const controllerMeta of controllerMetas) {
    const { path: rootPath, controller } = controllerMeta
    if (!rootPath) {
      logger.error('this class is not controller')
    }
    const controllerMethods = getInstanceMethods(controller).filter(
      (methodName) => methodName !== 'constructor'
    )
    for (const methodName of controllerMethods) {
      const routerMeta: RouterMetadata = Reflect.getMetadata(
        META_ROUTER,
        controller[`_${methodName}` as keyof object] // 通过`_key`获取原始函数
      )
      if (!routerMeta) {
        break
      }
      const { path, methods: routeMethods } = routerMeta
      const routePath = resolvePath(rootPath, path)
      for (const routeMethod of routeMethods) {
        router[routeMethod](routePath, async (ctx: Context, next: Next) => {
          try {
            await (controller as any)[methodName](ctx, next)
          } catch (err) {
            logger.error(err)
          }
        })
      }
    }
  }
  return router
}
