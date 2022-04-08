import { MType, BaseMiddleware, Aop, KoaMiddleware } from './constants'

import { logger } from '@kever/logger'
import {
  construct,
  META_MIDDLEWARE_ALL,
  META_MIDDLEWARE_GLOBAL,
  META_MIDDLEWARE_ROUTER,
  Container,
  Tag,
  poolContainer,
  isBoolean,
} from '@kever/shared'
import { middlewarePatchContainer } from './patch'
import { isPromise } from '../utils'

export const middlewareGlobalContainer = Object.create({})
export const middlewareAllContainer = Object.create({})

const middlewarePropertyContainer = new Container<
  Tag,
  ReturnType<BaseMiddleware<MType.Property>['ready']>
>()
const middlewareRouteContainer = new Container<
  Tag,
  BaseMiddleware<MType.Route>['ready']
>()

/**
 * @description property middleware
 * @param tag
 * @returns
 */
const propertyMiddleware =
  (tag: Tag): PropertyDecorator =>
  (target, propertyKey) => {
    middlewarePropertyContainer.on(tag, (middleware) => {
      if (!middleware) {
        logger.error(`${tag.toString()} type property middleware no exists`)
        return
      }
      let pool = poolContainer.use(target)
      if (isBoolean(pool)) {
        pool = new Container<PropertyKey, unknown>()
      }
      pool.bind(propertyKey, middleware)
      poolContainer.bind(target, pool)
    })
  }

export interface RouteMiddlewareMeta {
  [Aop.After]: KoaMiddleware[]
  [Aop.Before]: KoaMiddleware[]
  middlewareKey: Tag
}
/**
 * @description router Middleware
 * @param tag
 * @param type
 * @param param
 * @returns
 */
const routeMiddleware =
  <T>(tag: Tag, type: Aop, param?: T): MethodDecorator =>
  (target, key, description) => {
    middlewareRouteContainer.on(tag, (middleware) => {
      if (!middleware) {
        logger.error(`${tag.toString()} type router middleware no exists`)
        return
      }
      const middlewareReady = middleware(
        description.value as unknown as KoaMiddleware,
        param
      ) as KoaMiddleware

      let routeMeta: RouteMiddlewareMeta = Reflect.getMetadata(
        META_MIDDLEWARE_ROUTER,
        description.value as unknown as Function
      )
      if (!routeMeta) {
        routeMeta = {
          [Aop.After]: [],
          [Aop.Before]: [],
          middlewareKey: key,
        }
      }
      if (type === Aop.Duplex) {
        routeMeta[Aop.After].push(middlewareReady)
        routeMeta[Aop.Before].push(middlewareReady)
      } else {
        routeMeta[type].push(middlewareReady)
      }

      Reflect.defineMetadata(
        META_MIDDLEWARE_ROUTER,
        routeMeta,
        description.value as unknown as Function
      )
    })
    return description
  }

/**
 * @description get all global middleware
 * @returns
 */
export const getGlobalMiddleware = () => {
  const globalMiddlewares = Reflect.getMetadata(
    META_MIDDLEWARE_GLOBAL,
    middlewareGlobalContainer,
    META_MIDDLEWARE_GLOBAL
  ) as Set<BaseMiddleware<MType.Global>>
  return [...globalMiddlewares] || []
}

/**
 * @description destory all middleware
 */
export const destoryAllMiddleware = () => {
  const instances = Reflect.getMetadata(
    META_MIDDLEWARE_ALL,
    middlewareAllContainer,
    META_MIDDLEWARE_ALL
  ) as Set<BaseMiddleware<MType.Global>>

  if (instances) {
    for (let instance of instances) {
      instance.destory && instance.destory()
    }
  }
}

/**
 * @description Middleware
 * @param tag
 * @param type
 * @returns
 */
export const Middleware =
  (tag: Tag, type: MType): ClassDecorator =>
  (target) => {
    const middlewareOptions = middlewarePatchContainer.use(tag)
    const parameter: unknown[] = []
    if (middlewareOptions) {
      parameter.push(middlewareOptions)
    }
    const middlewareInstance = construct(target, parameter)
    switch (type) {
      case MType.Property:
        definePropertyMiddleware(middlewareInstance, tag)
        break
      case MType.Route:
        defineRouteMiddleware(middlewareInstance, tag)
        break
      case MType.Global:
        defineGolbalMiddleware(middlewareInstance)
        break
    }
    // Store all middleware instances
    defineMiddlewareInstance(middlewareInstance)
    return target
  }

/**
 * @description define route middleware
 * @param middlewareInstance
 * @param tag
 */
const defineRouteMiddleware = (
  middlewareInstance: BaseMiddleware<MType.Route>,
  tag: Tag
) => {
  const readyMethod = (
    middlewareInstance as BaseMiddleware<MType.Route>
  ).ready.bind(middlewareInstance)
  middlewareRouteContainer.bind(tag, readyMethod)
}
/**
 * @description define property middleware
 * @param middlewareInstance
 * @param tag
 */
const definePropertyMiddleware = (
  middlewareInstance: BaseMiddleware<MType.Property>,
  tag: Tag
) => {
  const readyResult = (
    middlewareInstance as BaseMiddleware<MType.Property>
  ).ready() as Promise<any> | any
  if (isPromise(readyResult)) {
    readyResult
      .then((payload: unknown) => {
        middlewarePropertyContainer.bind(tag, payload)
      })
      .catch((err: unknown) => {
        logger.error(
          `${tag.toString()} property middleware ready method error ${err}`
        )
      })
  } else {
    middlewarePropertyContainer.bind(tag, readyResult)
  }
}
/**
 * @description define golbal middleware
 * @param middlewareInstance
 */
const defineGolbalMiddleware = (
  middlewareInstance: BaseMiddleware<MType.Global>
) => {
  let golbalMiddlewares = Reflect.getMetadata(
    META_MIDDLEWARE_GLOBAL,
    middlewareGlobalContainer,
    META_MIDDLEWARE_GLOBAL
  ) as Set<BaseMiddleware<MType.Global>['ready']> | undefined
  if (!golbalMiddlewares) {
    golbalMiddlewares = new Set<BaseMiddleware<MType.Global>['ready']>()
  }
  const middleware = (
    middlewareInstance as BaseMiddleware<MType.Global>
  ).ready.bind(middlewareInstance)
  golbalMiddlewares.add(middleware)
  Reflect.defineMetadata(
    META_MIDDLEWARE_GLOBAL,
    golbalMiddlewares,
    middlewareGlobalContainer,
    META_MIDDLEWARE_GLOBAL
  )
}

/**
 * @description define middlewareInstance in all
 * @param middleware
 */
const defineMiddlewareInstance = (middleware: BaseMiddleware<MType.Global>) => {
  let allMiddlewares = Reflect.getMetadata(
    META_MIDDLEWARE_ALL,
    middlewareAllContainer,
    META_MIDDLEWARE_ALL
  )
  if (!allMiddlewares) {
    allMiddlewares = new Set<BaseMiddleware<MType.Global>>()
  }
  allMiddlewares.add(middleware)
  Reflect.defineMetadata(
    META_MIDDLEWARE_ALL,
    allMiddlewares,
    middlewareAllContainer,
    META_MIDDLEWARE_ALL
  )
}

interface RouterMiddlewareParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

type MiddlewareUseParam<T extends MType, U> = T extends MType.Route
  ? RouterMiddlewareParams<U>
  : Tag

type MiddlewareUseReturn<T extends MType> = T extends MType.Route
  ? MethodDecorator
  : PropertyDecorator

/**
 * @description Middleware.use
 * @param type
 * @param param
 * @returns
 */
Middleware.use = <T, P extends MType>(
  type: P,
  param: MiddlewareUseParam<P, T>
): MiddlewareUseReturn<P> => {
  if (type === MType.Property) {
    return propertyMiddleware(param as Tag) as MiddlewareUseReturn<P>
  }
  const routerParam = param as RouterMiddlewareParams<T>
  return routeMiddleware<T>(
    routerParam.tag,
    routerParam.aop,
    routerParam.params
  ) as MiddlewareUseReturn<P>
}
