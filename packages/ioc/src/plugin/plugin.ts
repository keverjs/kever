import { Tag, InstanceType } from '../instancePool'
import {
  pluginPool,
  PluginType,
  BasePlugin,
  Aop,
  isPromise,
  PropertyPluginMeta,
  routerPool,
  RouterPluginMeta,
  Middleware,
} from './util'

import { logger } from '@kever/logger'
import { pluginPatchPool } from './patch'
import { propertyPool, construct } from '../construct'

const propertyPlugin = (tag: Tag): PropertyDecorator => (
  target,
  propertyKey
) => {
  const plugin = pluginPool.use(tag)
  if (typeof plugin === 'boolean') {
    pluginPool.on(tag, (plugin) => {
      if (plugin.type === PluginType.Property) {
        propertyPluginPoolEventHandler(target, propertyKey, plugin)
      } else {
        logger.error(`${tag.toString()} type property plugin no exists`)
      }
    })
  } else if (plugin.type === PluginType.Property) {
    propertyPluginPoolEventHandler(target, propertyKey, plugin)
  } else {
    logger.error(`${tag.toString()} type property plugin no exists`)
  }
}

const propertyPluginPoolEventHandler = (
  target: Object,
  propertyKey: Tag,
  plugin: PropertyPluginMeta
) => {
  const result = plugin.payload

  const poolKey = target.constructor.name
  let pool = propertyPool.use(poolKey)

  if (typeof pool === 'boolean') {
    pool = new Map<string, unknown>()
  }
  pool.set(propertyKey, result)
  propertyPool.bind(poolKey, pool)
}

const routerPlugin = <T>(tag: Tag, type: Aop, param?: T): MethodDecorator => (
  target,
  key,
  description
) => {
  const plugin = pluginPool.use(tag)

  if (typeof plugin === 'boolean') {
    pluginPool.on(tag, (plugin) => {
      if (plugin.type !== PluginType.Router) {
        logger.error(`${tag.toString()} type property plugin no exists`)
      } else {
        routerPluginPoolEventHandler(
          tag,
          type,
          target,
          key,
          (description.value as unknown) as Middleware,
          plugin,
          param
        )
      }
    })
  } else if (plugin.type === PluginType.Router) {
    routerPluginPoolEventHandler(
      tag,
      type,
      target,
      key,
      (description.value as unknown) as Middleware,
      plugin,
      param
    )
  } else {
    logger.error(`${tag.toString()} type property plugin no exists`)
  }
  return description
}
const routerPluginPoolEventHandler = <T>(
  tag: Tag,
  type: Aop,
  target: Object,
  key: Tag,
  raw: Middleware,
  plugin: RouterPluginMeta,
  param?: T
) => {
  const readyMiddleware = plugin.instance.ready.call(
    plugin.instance,
    raw,
    param
  )
  const pluginKey = `${target.constructor.name}-${key.toString()}`
  let routerInfo = routerPool.use(pluginKey)
  if (typeof routerInfo === 'boolean') {
    routerInfo = {
      [Aop.After]: new Set<Middleware>(),
      [Aop.Before]: new Set<Middleware>(),
      propertyKey: key,
      target,
    }
    routerPool.bind(pluginKey, routerInfo)
  }
  if (type === Aop.Duplex) {
    routerInfo[Aop.After].add(readyMiddleware)
    routerInfo[Aop.Before].add(readyMiddleware)
  } else {
    routerInfo[type].add(readyMiddleware)
  }
}

export const getGlobalPlugin = () => {
  const pool = pluginPool.getPool()
  let globalPlugins: Function[] = []
  for (const pluginMeta of pool.values()) {
    if (pluginMeta.type === PluginType.Global) {
      const readyFn =
        pluginMeta.instance &&
        pluginMeta.instance.ready.bind(pluginMeta.instance)
      globalPlugins.push(readyFn)
    }
  }
  return globalPlugins
}

const getAllPlugin = () => {
  const pool = pluginPool.getPool()
  let instancePool = new Set<
    BasePlugin<PluginType.Global | PluginType.Property | PluginType.Router>
  >()
  for (const pluginMeta of pool.values()) {
    instancePool.add(pluginMeta.instance)
  }
  return instancePool
}

export const destoryAllPlugin = () => {
  const instances = getAllPlugin()
  for (const instance of instances.values()) {
    instance.destory && instance.destory()
  }
}

export const Plugin = (tag: Tag, type: PluginType): ClassDecorator => (
  target
) => {
  const constructor = (target as unknown) as InstanceType

  const pluginOptions = pluginPatchPool.use(tag)
  const pluginInstance = construct(constructor, [pluginOptions])
  if (type !== PluginType.Property) {
    pluginPool.bind(tag, {
      type,
      instance: pluginInstance,
    })
    return target
  }
  const readyResult = pluginInstance.ready() as Promise<any> | any
  if (isPromise(readyResult)) {
    readyResult.then((payload: unknown) => {
      pluginPool.bind(tag, {
        type,
        instance: pluginInstance,
        payload,
      })
    })
  } else {
    pluginPool.bind(tag, {
      type,
      instance: pluginInstance,
      payload: readyResult,
    })
  }
  return target
}

interface RouterPluginParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

type PluginUseParam<T extends PluginType, U> = T extends PluginType.Router
  ? RouterPluginParams<U>
  : Tag

type PluginUseReturn<T extends PluginType> = T extends PluginType.Router
  ? MethodDecorator
  : PropertyDecorator

Plugin.use = <T, P extends PluginType>(
  type: P,
  param: PluginUseParam<P, T>
): PluginUseReturn<P> => {
  if (type === PluginType.Property) {
    return propertyPlugin(param as Tag) as PluginUseReturn<P>
  }
  const routerParam = param as RouterPluginParams<T>
  return routerPlugin<T>(
    routerParam.tag,
    routerParam.aop,
    routerParam.params
  ) as PluginUseReturn<P>
}
