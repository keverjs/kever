import type { Context, Next } from 'koa'
import { MType, BaseMiddleware, Aop, KoaMiddleware } from './constants'
import {
  construct,
  META_MIDDLEWARE_ALL,
  META_MIDDLEWARE_GLOBAL,
  META_MIDDLEWARE_ROUTER,
  Container,
  Tag,
  poolContainer,
  isBoolean,
  isPromise,
  getMetadata,
  setMetadata,
  getMetadataStore,
  META_LOGGER
} from '@kever/shared'
import { mdPatchContainer } from './patch'
import type { Logger } from '@kever/core'

const MD_GOLABL_TARGET = Object.create(null)
const MD_ALL_TARGET = Object.create(null)

const mdPropertyContainer = new Container<Tag, ReturnType<BaseMiddleware<MType.Property>['ready']>>()
const mdRouteContainer = new Container<Tag, BaseMiddleware<MType.Route>['ready']>()

/**
 * @description property middleware
 * @param tag
 * @returns
 */
const propertyMiddleware = (tag: Tag): PropertyDecorator => (target, propertyKey) => {
  let pool = poolContainer.use(target)
  if (isBoolean(pool)) {
    pool = new Container<PropertyKey, unknown>()
  }
  pool.bind(propertyKey, undefined)
  poolContainer.bind(target, pool)
  mdPropertyContainer.on(tag, (middleware) => {
    if (!middleware) {
      const logger = getMetadataStore<Logger>(META_LOGGER)
      logger.error(`${tag.toString()} type property middleware no exists`)
      return
    }
    if (!isBoolean(pool)) {
      pool.bind(propertyKey, middleware)
    }
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
const routeMiddleware = <T>(tag: Tag, type: Aop, param?: T): MethodDecorator => (_, key, description) => {
  mdRouteContainer.on(tag, (middleware) => {
    if (!middleware) {
      const logger = getMetadataStore<Logger>(META_LOGGER)
      logger.error(`${tag.toString()} type router middleware no exists`)
      return
    }
    const middlewareReady = middleware(
      description.value as unknown as KoaMiddleware,
      param
    ) as KoaMiddleware

    let routeMeta = getMetadata<RouteMiddlewareMeta>(
      META_MIDDLEWARE_ROUTER,
      description.value as unknown as Function
    )
    if (!routeMeta) {
      routeMeta = { [Aop.After]: [], [Aop.Before]: [], middlewareKey: key }
    }
    if (type === Aop.Duplex) {
      routeMeta[Aop.After].push(middlewareReady)
      routeMeta[Aop.Before].push(middlewareReady)
    } else {
      routeMeta[type].push(middlewareReady)
    }

    setMetadata(
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
  const gMds = getMetadata<Set<BaseMiddleware<MType.Global>['ready']>>(
    META_MIDDLEWARE_GLOBAL,
    MD_GOLABL_TARGET,
    META_MIDDLEWARE_GLOBAL
  )
  return gMds || new Set()
}

/**
 * @description destory all middleware
 */
export const destoryAllMiddleware = () => {
  const mds = getMetadata<Set<BaseMiddleware<MType.Global>>>(
    META_MIDDLEWARE_ALL,
    MD_ALL_TARGET,
    META_MIDDLEWARE_ALL
  )
  mds && mds.forEach(md => (md.destory && md.destory()))
}

/**
 * @description Middleware
 * @param tag
 * @param type
 * @returns
 */
export const Middleware = (tag: Tag, type: MType): ClassDecorator => (target) => {
  const mdOptions = mdPatchContainer.use(tag)
  const parameter: unknown[] = []
  if (mdOptions) {
    parameter.push(mdOptions)
  }
  const mdInstance = construct(target, parameter)
  switch (type) {
    case MType.Property:
      definePropertyMiddleware(mdInstance, tag)
      break
    case MType.Route:
      defineRouteMiddleware(mdInstance, tag)
      break
    case MType.Global:
      defineGolbalMiddleware(mdInstance)
      break
  }
  // Store all middleware instances
  defineMiddlewareInstance(mdInstance)
  return target
}

/**
 * @description define route middleware
 * @param middlewareInstance
 * @param tag
 */
const defineRouteMiddleware = (mdInstance: BaseMiddleware<MType.Route>, tag: Tag) => {
  const ready = (mdInstance as BaseMiddleware<MType.Route>).ready.bind(mdInstance)
  mdRouteContainer.bind(tag, ready)
}
/**
 * @description define property middleware
 * @param middlewareInstance
 * @param tag
 */
const definePropertyMiddleware = (mdInstance: BaseMiddleware<MType.Property>, tag: Tag) => {
  const readyResult = (mdInstance as BaseMiddleware<MType.Property>).ready() as Promise<any> | any
  if (isPromise(readyResult)) {
    readyResult
      .then((payload: unknown) => mdPropertyContainer.bind(tag, payload))
      .catch((err: unknown) => {
        const logger = getMetadataStore<Logger>(META_LOGGER)
        logger.error(`${tag.toString()} property middleware ready method error ${err}`)
      })
  } else {
    mdPropertyContainer.bind(tag, readyResult)
  }
}
/**
 * @description define golbal middleware
 * @param middlewareInstance
 */
const defineGolbalMiddleware = (middlewareInstance: BaseMiddleware<MType.Global>) => {
  let gMiddlewares = getMetadata<Set<BaseMiddleware<MType.Global>['ready']> | undefined>(
    META_MIDDLEWARE_GLOBAL,
    MD_GOLABL_TARGET,
    META_MIDDLEWARE_GLOBAL
  )
  if (!gMiddlewares) {
    gMiddlewares = new Set<BaseMiddleware<MType.Global>['ready']>()
  }
  const middleware = (middlewareInstance as BaseMiddleware<MType.Global>).ready.bind(middlewareInstance)
  gMiddlewares.add(middleware)
  setMetadata(META_MIDDLEWARE_GLOBAL, gMiddlewares, MD_GOLABL_TARGET, META_MIDDLEWARE_GLOBAL)
}

/**
 * @description define middlewareInstance in all
 * @param middleware
 */
const defineMiddlewareInstance = (middleware: BaseMiddleware<MType.Global>) => {
  let mds = getMetadata<Set<BaseMiddleware<MType.Global>>>(
    META_MIDDLEWARE_ALL,
    MD_ALL_TARGET,
    META_MIDDLEWARE_ALL
  )
  if (!mds) {
    mds = new Set<BaseMiddleware<MType.Global>>()
  }
  mds.add(middleware)
  setMetadata(META_MIDDLEWARE_ALL, mds, MD_ALL_TARGET, META_MIDDLEWARE_ALL)
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
Middleware.use = <T, P extends MType>(type: P, param: MiddlewareUseParam<P, T>): MiddlewareUseReturn<P> => {
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
