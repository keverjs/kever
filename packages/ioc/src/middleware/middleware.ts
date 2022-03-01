import { Tag, InstanceType } from '../instancePool'
import {
  middlewarePool,
  MType,
  BaseMiddleware,
  Aop,
  isPromise,
  PropertyMiddlewareMeta,
  routerPool,
  RouterMiddlewareMeta,
  KoaMiddleware,
} from './util'

import { logger } from '@kever/logger'
import { middlewarePatchPool } from './patch'
import { propertyPool, construct } from '../construct'

const propertyMiddleware =
  (tag: Tag): PropertyDecorator =>
  (target, propertyKey) => {
    const middleware = middlewarePool.use(tag)
    if (typeof middleware === 'boolean') {
      middlewarePool.on(tag, (middleware) => {
        if (middleware.type === MType.Property) {
          propertyMiddlewarePoolEventHandler(target, propertyKey, middleware)
        } else {
          logger.error(`${tag.toString()} type property middleware no exists`)
        }
      })
    } else if (middleware.type === MType.Property) {
      propertyMiddlewarePoolEventHandler(target, propertyKey, middleware)
    } else {
      logger.error(`${tag.toString()} type property middleware no exists`)
    }
  }

const propertyMiddlewarePoolEventHandler = (
  target: Object,
  propertyKey: Tag,
  middleware: PropertyMiddlewareMeta
) => {
  const result = middleware.payload

  const poolKey = target.constructor.name
  let pool = propertyPool.use(poolKey)

  if (typeof pool === 'boolean') {
    pool = new Map<string, unknown>()
  }
  pool.set(propertyKey, result)
  propertyPool.bind(poolKey, pool)
}

const routerMiddleware =
  <T>(tag: Tag, type: Aop, param?: T): MethodDecorator =>
  (target, key, description) => {
    const middleware = middlewarePool.use(tag)

    if (typeof middleware === 'boolean') {
      middlewarePool.on(tag, (middleware) => {
        if (middleware.type !== MType.Router) {
          logger.error(`${tag.toString()} type router middleware no exists`)
        } else {
          routerMiddlewarePoolEventHandler(
            tag,
            type,
            target,
            key,
            description.value as unknown as KoaMiddleware,
            middleware,
            param
          )
        }
      })
    } else if (middleware.type === MType.Router) {
      routerMiddlewarePoolEventHandler(
        tag,
        type,
        target,
        key,
        description.value as unknown as KoaMiddleware,
        middleware,
        param
      )
    } else {
      logger.error(`${tag.toString()} type router middleware no exists`)
    }
    return description
  }
const routerMiddlewarePoolEventHandler = <T>(
  tag: Tag,
  type: Aop,
  target: Object,
  key: Tag,
  raw: KoaMiddleware,
  middleware: RouterMiddlewareMeta,
  param?: T
) => {
  const readyMiddleware = middleware.instance.ready.call(
    middleware.instance,
    raw,
    param
  )
  const middlewareKey = `${target.constructor.name}-${key.toString()}`
  let routerInfo = routerPool.use(middlewareKey)
  if (typeof routerInfo === 'boolean') {
    routerInfo = {
      [Aop.After]: new Set<KoaMiddleware>(),
      [Aop.Before]: new Set<KoaMiddleware>(),
      propertyKey: key,
      target,
    }
    routerPool.bind(middlewareKey, routerInfo)
  }
  if (type === Aop.Duplex) {
    routerInfo[Aop.After].add(readyMiddleware)
    routerInfo[Aop.Before].add(readyMiddleware)
  } else {
    routerInfo[type].add(readyMiddleware)
  }
}

export const getGlobalMiddleware = () => {
  const pool = middlewarePool.getPool()
  let globalMiddlewares: Function[] = []
  for (const middlewareMeta of pool.values()) {
    if (middlewareMeta.type === MType.Global) {
      const readyFn =
        middlewareMeta.instance &&
        middlewareMeta.instance.ready.bind(middlewareMeta.instance)
      globalMiddlewares.push(readyFn)
    }
  }
  return globalMiddlewares
}

const getAllMiddleware = () => {
  const pool = middlewarePool.getPool()
  let instancePool = new Set<
    BaseMiddleware<MType.Global | MType.Property | MType.Router>
  >()
  for (const middlewareMeta of pool.values()) {
    instancePool.add(middlewareMeta.instance)
  }
  return instancePool
}

export const destoryAllMiddleware = () => {
  const instances = getAllMiddleware()
  for (const instance of instances.values()) {
    instance.destory && instance.destory()
  }
}

export const Middleware =
  (tag: Tag, type: MType): ClassDecorator =>
  (target) => {
    const constructor = target as unknown as InstanceType

    const middlewareOptions = middlewarePatchPool.use(tag)
    const middlewareInstance = construct(constructor, [middlewareOptions])
    if (type !== MType.Property) {
      middlewarePool.bind(tag, {
        type,
        instance: middlewareInstance,
      })
      return target
    }
    const readyResult = middlewareInstance.ready() as Promise<any> | any
    if (isPromise(readyResult)) {
      readyResult.then((payload: unknown) => {
        middlewarePool.bind(tag, {
          type,
          instance: middlewareInstance,
          payload,
        })
      })
    } else {
      middlewarePool.bind(tag, {
        type,
        instance: middlewareInstance,
        payload: readyResult,
      })
    }
    return target
  }

interface RouterMiddlewareParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

type MiddlewareUseParam<T extends MType, U> = T extends MType.Router
  ? RouterMiddlewareParams<U>
  : Tag

type MiddlewareUseReturn<T extends MType> = T extends MType.Router
  ? MethodDecorator
  : PropertyDecorator

Middleware.use = <T, P extends MType>(
  type: P,
  param: MiddlewareUseParam<P, T>
): MiddlewareUseReturn<P> => {
  if (type === MType.Property) {
    return propertyMiddleware(param as Tag) as MiddlewareUseReturn<P>
  }
  const routerParam = param as RouterMiddlewareParams<T>
  return routerMiddleware<T>(
    routerParam.tag,
    routerParam.aop,
    routerParam.params
  ) as MiddlewareUseReturn<P>
}
