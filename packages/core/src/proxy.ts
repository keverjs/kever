import { iocPlugins, IocPlugin } from '@kever/ioc'

type Tag = string | symbol

const processPluginsToKV = () => {
  return [...iocPlugins].reduce((target, plugin) => {
    const targetPlugins = target.get(plugin.target)
    if (targetPlugins) {
      targetPlugins.set(plugin.propertyKey, plugin)
    } else {
      const plugins = new Map<Tag, IocPlugin>()
      plugins.set(plugin.propertyKey, plugin)
      target.set(plugin.target, plugins)
    }
    return target
  }, new Map<Object, Map<Tag, IocPlugin>>())
}

const pluginKV = processPluginsToKV()

export const controllersToproxy = (controller: Object) => {
  const plugins = pluginKV.get(Object.getPrototypeOf(controller))
  if (!plugins) {
    return controller
  }
  return new Proxy(controller, {
    get(target, propertyKey, receiver) {
      const plugin = plugins.get(propertyKey)
      if (plugin) {
        return plugin.plugin
      }
      return Reflect.get(target, propertyKey, receiver)
    },
  })
}
