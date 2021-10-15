import { Tag, InstancePool, InstanceType } from '../instancePool'
import {
  pluginPool,
  PluginType,
  BasePlugin,
  Aop,
  RouterInfo,
  PluginMetaType,
  PropertyPluginMetaType,
  isPromise,
} from './util'

import { logger } from '@kever/logger'
import { Context, Next } from 'koa'
import { pluginPatchPool } from './patch'
import { iocPlugins } from './index'

const propertyPlugin = (tag: Tag): PropertyDecorator => (
  target,
  propertyKey
) => {
  const plugin = pluginPool.use(tag)
  if (typeof plugin === 'boolean') {
    pluginPool.on(tag, (plugin) => {
      propertyPluginPoolEventHandler(tag, target, propertyKey, plugin)
    })
  } else {
    propertyPluginPoolEventHandler(tag, target, propertyKey, plugin)
  }
}

const propertyPluginPoolEventHandler = (
  tag: Tag,
  target: Object,
  propertyKey: Tag,
  plugin: PluginMetaType | PropertyPluginMetaType
) => {
  if (plugin.type !== PluginType.Property) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }
  iocPlugins.add({
    type: PluginType.Property,
    target,
    propertyKey,
    plugin: plugin.payload,
  })
}

const routerPool = new InstancePool<string, RouterInfo>()

const routerPlugin = <T>(tag: Tag, type: Aop, param?: T): MethodDecorator => {
  const plugin = pluginPool.use(tag)

  if (typeof plugin === 'boolean') {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  if (plugin.type !== PluginType.Router) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  return (target, propertyKey, description) => {
    const pluginKey = `${tag.toString()}-${propertyKey.toString()}-${
      target.constructor.name
    }`
    const router = routerPool.use(pluginKey)

    if (typeof router !== 'boolean') {
      if (type === Aop.Before || type === Aop.After) {
        router[type].add(plugin.instance)
      }
      if (type === Aop.Duplex) {
        router[Aop.Before].add(plugin.instance)
        router[Aop.After].add(plugin.instance)
      }
    } else {
      const oldRouteHandle = ((description.value as unknown) as Function).bind(
        target
      )
      const routerTmp = {
        [Aop.Before]: new Set<BasePlugin>(),
        [Aop.After]: new Set<BasePlugin>(),
        raw: oldRouteHandle,
      }
      if (type === Aop.Before || type === Aop.After) {
        routerTmp[type].add(plugin.instance)
      }
      if (type === Aop.Duplex) {
        routerTmp[Aop.Before].add(plugin.instance)
        routerTmp[Aop.After].add(plugin.instance)
      }
      routerPool.bind(pluginKey, routerTmp)
    }
    const payload = async (ctx?: Context, next?: Next) => {
      const router = routerPool.use(pluginKey)
      if (typeof router === 'boolean') {
        return
      }
      const oldRouterHandler = router.raw
      const beforePlugins = router[Aop.Before]
      const afterPlugins = router[Aop.After]
      for (let plugin of beforePlugins) {
        const beforePluginResult = await (plugin &&
          plugin.ready(oldRouterHandler, ctx, next, param))
        if (!beforePluginResult) {
          return
        }
      }
      await (oldRouterHandler && oldRouterHandler(ctx, next))
      for (let plugin of afterPlugins) {
        const afterPluginResult = await (plugin &&
          plugin.ready(oldRouterHandler, ctx, next, param))
        if (!afterPluginResult) {
          return
        }
      }
    }
    iocPlugins.add({
      type: PluginType.Router,
      target,
      propertyKey,
      plugin: payload,
    })
    return description
  }
}

export const getGlobalPlugin = () => {
  const pool = pluginPool.getPool()
  let globalPlugins: Function[] = []
  for (const pluginMeta of pool.values()) {
    if (pluginMeta.type === PluginType.Global) {
      const readyFn: Function =
        pluginMeta.instance &&
        pluginMeta.instance.ready.bind(pluginMeta.instance)
      globalPlugins.push(readyFn)
    }
  }
  return globalPlugins
}

export const getAllPlugin = () => {
  const pool = pluginPool.getPool()
  let instancePool = new Set<BasePlugin>()
  for (const pluginMeta of pool.values()) {
    instancePool.add(pluginMeta.instance)
  }
  return instancePool
}

export const Plugin = (tag: Tag, type: PluginType): ClassDecorator => (
  target
) => {
  const constructor = (target as unknown) as InstanceType

  const pluginOptions = pluginPatchPool.use(tag)
  const pluginInstance = new constructor(pluginOptions)
  if (type === PluginType.Property) {
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
  } else {
    pluginPool.bind(tag, {
      type,
      instance: pluginInstance,
    })
  }
}

interface RouterPluginParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

type PluginParam<T extends PluginType, U> = T extends PluginType.Router
  ? RouterPluginParams<U>
  : Tag

type PluginReturn<T extends PluginType> = T extends PluginType.Router
  ? MethodDecorator
  : PropertyDecorator

Plugin.use = <T, P extends PluginType>(
  type: P,
  param: PluginParam<P, T>
): PluginReturn<P> => {
  if (type === PluginType.Property) {
    return propertyPlugin(param as Tag) as PluginReturn<P>
  }
  const routerParam = param as RouterPluginParams<T>
  return routerPlugin<T>(
    routerParam.tag,
    routerParam.aop,
    routerParam.params
  ) as PluginReturn<P>
}
