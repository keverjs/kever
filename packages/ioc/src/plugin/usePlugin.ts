import { Tag, InstancePool } from '../instancePool'
import {
  pluginPool,
  PluginType,
  BasePlugin,
  Aop,
  RouterInfo,
  PluginMetaType,
  PropertyPluginMetaType,
} from './util'

import { logger } from '@kever/logger'
import { Context, Next } from 'koa'

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
  if (plugin.type !== PluginType.property) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }
  const result = plugin.instance
  Object.defineProperty(target, propertyKey, {
    value: result,
    writable: false,
    configurable: false,
    enumerable: true,
  })
}

const routerPool = new InstancePool<string, RouterInfo>()

const routerPlugin = <T>(tag: Tag, type: Aop, param?: T): MethodDecorator => {
  const plugin = pluginPool.use(tag)

  if (typeof plugin === 'boolean') {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  if (plugin.type !== PluginType.router) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  return (target, propertyKey, description) => {
    const pluginKey = `${tag.toString()}-${propertyKey.toString()}-${
      target.constructor.name
    }`
    const router = routerPool.use(pluginKey)

    if (typeof router !== 'boolean') {
      const routerPlugins = router[type]
      routerPlugins.add(plugin.instance)
    } else {
      const oldRouteHandle = ((description.value as unknown) as Function).bind(
        target
      )
      const routerTmp = {
        [Aop.before]: new Set<BasePlugin>(),
        [Aop.after]: new Set<BasePlugin>(),
        raw: oldRouteHandle,
      }
      const routerPlugins = routerTmp[type]
      routerPlugins.add(plugin.instance)

      routerPool.bind(pluginKey, routerTmp)
    }

    ;((description.value as unknown) as Function) = async (
      ctx?: Context,
      next?: Next
    ) => {
      const router = routerPool.use(pluginKey)
      if (typeof router === 'boolean') {
        return
      }
      const oldRouterHandler = router.raw
      const beforePlugins = router[Aop.before]
      const afterPlugins = router[Aop.after]
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
    return description
  }
}

export const getGlobalPlugin = () => {
  const ret = pluginPool.getPoll()
  let globalPlugins: Function[] = []
  for (const pluginMeta of ret.values()) {
    if (pluginMeta.type === PluginType.global) {
      const readyFn: Function =
        pluginMeta.instance &&
        pluginMeta.instance.ready.bind(pluginMeta.instance)
      globalPlugins.push(readyFn)
    }
  }
  return globalPlugins
}

interface RouterPluginParams<T> {
  tag: Tag
  aop: Aop
  params?: T
}

type PluginParam<T extends PluginType, U> = T extends PluginType.router
  ? RouterPluginParams<U>
  : Tag

type PluginReturn<T extends PluginType> = T extends PluginType.router
  ? MethodDecorator
  : PropertyDecorator

export function UsePlugin<T, P extends PluginType>(
  type: P,
  param: PluginParam<P, T>
): PluginReturn<P> {
  if (type === PluginType.property) {
    return propertyPlugin(param as Tag) as PluginReturn<P>
  }
  const routerParam = param as RouterPluginParams<T>
  return routerPlugin<T>(
    routerParam.tag,
    routerParam.aop,
    routerParam.params
  ) as PluginReturn<P>
}
