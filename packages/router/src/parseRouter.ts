import Router from 'koa-router'
import { Aop, RouteMiddlewareMeta } from '@kever/ioc'
import type { App } from '@kever/core'
import { getInstanceMethods, resolvePath } from './util'
import { RouterMetadata } from './methodsDecorator'
import { META_MIDDLEWARE_ROUTER, META_ROUTER, getMetadata, type ControllerMeta } from '@kever/shared'

export function parseRouter(app: App, controllerMetas: Set<ControllerMeta>): Router {
  const router = new Router()
  for (const controllerMeta of controllerMetas) {
    const { path: rootPath, controller } = controllerMeta
    if (!rootPath) {
      app.options.logger.error('this class is not controller')
    }
    const controllerMethods = getInstanceMethods(controller).filter(
      (methodName) => methodName !== 'constructor'
    )
    for (const methodName of controllerMethods) {
      const routerMeta = getMetadata<RouterMetadata>(META_ROUTER, controller[methodName as keyof object])
      const middlewareMeta = getMetadata<RouteMiddlewareMeta>(META_MIDDLEWARE_ROUTER, controller[methodName as keyof object])

      if (!routerMeta) {
        continue
      }
      // route path
      const { path, methods: routeMethods } = routerMeta
      const routePath = resolvePath(rootPath, path)

      // middleware
      const beforeMiddleware = middlewareMeta ? middlewareMeta[Aop.Before] : []
      const afterMiddleware = middlewareMeta ? middlewareMeta[Aop.After] : []

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
