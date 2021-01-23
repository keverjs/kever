import { Tag, InstancePool } from '../instancePool'
import { pluginPool, PluginType, BasePlugin, Aop, RouterInfo } from './util'

import { logger } from '@kever/logger'
import { Context, Next } from 'koa'

export const PropertyPlugin = <T>(tag: Tag, param?: T): PropertyDecorator => {
  const plugin = pluginPool.use(tag)

  if (typeof plugin === 'boolean') {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  if (plugin.type !== PluginType.property) {
    logger.error(`${tag.toString()} type property plugin no exists`)
    return () => {}
  }

  const result = plugin.instance && plugin.instance.ready(param)
  return async (target, propertyKey) => {
    Object.defineProperty(target, propertyKey, {
      value: result,
      writable: false,
      configurable: false,
      enumerable: true,
    })
  }
}

const routerPool = new InstancePool<string, RouterInfo>()

export const RouterPlugin = <T>(
  tag: Tag,
  type: Aop,
  param?: T
): MethodDecorator => {
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
        await (plugin && plugin.ready(oldRouterHandler, ctx, next, param))
      }
      await (oldRouterHandler && oldRouterHandler(ctx, next))
      for (let plugin of afterPlugins) {
        await (plugin && plugin.ready(oldRouterHandler, ctx, next, param))
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
