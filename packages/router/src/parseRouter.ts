import Router from 'koa-router'
import { Next, Context } from 'koa'
import { logger } from '@kever/logger'
import { Aop, routerPool } from '@kever/ioc'
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
        controller[methodName as keyof object]
      )
      if (!routerMeta) {
        break
      }
      const { path, methods: routeMethods } = routerMeta
      const routePath = resolvePath(rootPath, path)

      const routerPoolKey = `${
        controller.constructor.name
      }-${methodName.toString()}`
      const routerAopPool = routerPool.use(routerPoolKey)
      const beforeMiddleware =
        typeof routerAopPool !== 'boolean' ? [...routerAopPool[Aop.Before]] : []
      const afterMiddleware =
        typeof routerAopPool !== 'boolean' ? [...routerAopPool[Aop.After]] : []

      for (const routeMethod of routeMethods) {
        router[routeMethod](
          routePath,
          ...beforeMiddleware,
          (controller as any)[methodName],
          ...afterMiddleware
        )
      }
    }
  }
  return router
}
