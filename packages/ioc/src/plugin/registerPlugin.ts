import { Tag, InstanceType } from '../instancePool'
import { isPromise, pluginPool, PluginType } from './util'
import { pluginPatchPool } from './patch'
import { logger } from '@kever/logger'

export const RegisterPlugin = (tag: Tag, type: PluginType): ClassDecorator => (
  target
) => {
  const constructor = (target as unknown) as InstanceType
  //patch 传参
  const pluginOptions = pluginPatchPool.use(tag)
  const pluginInstance = new constructor(pluginOptions)
  if (type === PluginType.property) {
    const readyResult = pluginInstance.ready() as Promise<any> | any
    if (isPromise(readyResult)) {
      readyResult.then((instance: unknown) => {
        pluginPool.bind(tag, {
          type,
          instance: instance,
        })
      })
    } else {
      pluginPool.bind(tag, {
        type,
        instance: pluginInstance,
      })
    }
  } else {
    pluginPool.bind(tag, {
      type,
      instance: pluginInstance,
    })
  }
}
