import { Tag, InstancePool } from '../instancePool'
import {
  pluginPool,
  PluginType,
  BasePlugin,
  AopRoute,
  RoutePluginInfoType,
} from './util'
import { logger } from '@kever/logger'

type PropertyPluginType = (
  tag: Tag,
  payload?: {
    params?: any
  }
) => PropertyDecorator | void
export const usePropertyPlugin: PropertyPluginType = (tag, { params } = {}) => {
  const ret = pluginPool.use(tag)
  if (typeof ret === 'boolean') {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return
  }
  if (ret.type !== PluginType.property) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return
  }
  const result = ret.instance && ret.instance.ready(params)
  return async (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      value: result,
      writable: false,
      configurable: false,
      enumerable: true,
    })
  }
}

type RoutePluginType = <T>(
  tag: Tag,
  type: AopRoute,
  payload?: {
    params?: any
  }
) => MethodDecorator | void
const routePool = new InstancePool<string, RoutePluginInfoType>()
export const useRoutePlugin: RoutePluginType = (tag, type, { params } = {}) => {
  const pluginRet = pluginPool.use(tag)
  if (typeof pluginRet === 'boolean') {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return
  }
  if (pluginRet.type !== PluginType.route) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return
  }
  return (target, propertyKey, description) => {
    const pluginKey = `${tag.toString()}-${propertyKey.toString()}-${
      target.constructor.name
    }`
    const routeRet = routePool.use(pluginKey)
    if (typeof routeRet !== 'boolean') {
      const aopPlugin = routeRet[type]
      aopPlugin.add(pluginRet.instance)
    } else {
      const oldRouteHandle = ((description.value as unknown) as Function).bind(
        target
      )
      const routePluginInfo: RoutePluginInfoType = {
        [AopRoute.before]: new Set<BasePlugin>(),
        [AopRoute.after]: new Set<BasePlugin>(),
        raw: oldRouteHandle,
      }
      const aopPlugin = routePluginInfo[type]
      aopPlugin.add(pluginRet.instance)
      routePool.bind(pluginKey, routePluginInfo)
    }
    ;((description.value as unknown) as Function) = async (
      ...contextArgs: any[]
    ) => {
      const ret = routePool.use(pluginKey)
      if (typeof ret === 'boolean') {
        return
      }
      const raw = ret.raw
      const beforePlugins = ret[AopRoute.before]
      const afterPlugins = ret[AopRoute.after]
      for (let plugin of beforePlugins) {
        await (plugin && plugin.ready(raw, ...contextArgs, params))
      }
      await (raw && raw(...contextArgs))
      for (let plugin of afterPlugins) {
        await (plugin && plugin.ready(raw, ...contextArgs, params))
      }
    }
    return description
  }
}
export const getGlobalPlugin = () => {
  const ret = pluginPool.getPoll()
  let globalPlugins: Function[] = []
  for (const pluginMeta of ret.values()) {
    const pluginType = pluginMeta.type
    if (pluginType === PluginType.global) {
      const readyFn: Function =
        pluginMeta.instance &&
        pluginMeta.instance.ready.bind(pluginMeta.instance)
      globalPlugins.push(readyFn)
    }
  }
  return globalPlugins
}
