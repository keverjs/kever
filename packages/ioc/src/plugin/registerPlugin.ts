import { Tag, InstanceType } from '../instancePool'
import { pluginPool, PluginType } from './util'
import { pluginPatchPool } from './patch'
import { logger } from '@kever/logger'

export const RegisterPlugin = (tag: Tag, type: PluginType): ClassDecorator => (
  target
) => {
  const constructor = (target as unknown) as InstanceType
  //patch 传参
  const pluginOptions = pluginPatchPool.use(tag)
  const pluginInstance = new constructor(pluginOptions)
  const ret = pluginPool.bind(tag, {
    type,
    instance: pluginInstance,
  })
  if (!ret) {
    logger.error(`${tag.toString()} type plugin already exists`)
  }
}
