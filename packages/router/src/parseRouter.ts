import Router from 'koa-router'
import { logger } from '@kever/logger'
import { Aop, RouteMiddlewareMeta } from '@kever/ioc'
import { getInstanceMethods, resolvePath } from './util'
import { META_ROUTER, RouterMetadata } from './methodsDecorator'
import { META_MIDDLEWARE_ROUTER } from '@kever/shared'

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
      const middlewareMeta: RouteMiddlewareMeta = Reflect.getMetadata(
        META_MIDDLEWARE_ROUTER,
        controller[methodName as keyof object]
      )

      if (!routerMeta || !middlewareMeta) {
        break
      }
      // route path
      const { path, methods: routeMethods } = routerMeta
      const routePath = resolvePath(rootPath, path)

      // middleware
      middlewareMeta
      const beforeMiddleware = middlewareMeta[Aop.Before] || []
      const afterMiddleware = middlewareMeta[Aop.After] || []

      for (const routeMethod of routeMethods) {
        router[routeMethod](
          routePath,
          ...beforeMiddleware,
          (controller as any)[methodName].bind(controller),
          ...afterMiddleware
        )
      }
    }
  }
  return router
}
