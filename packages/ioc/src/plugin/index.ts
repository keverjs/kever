import { Tag } from '../../src/instancePool'
import { PluginType } from './util'
export interface IocPlugin {
  type: PluginType
  target: Object
  propertyKey: Tag
  plugin: unknown
}
export const iocPlugins = new Set<IocPlugin>()

export { PluginType, BasePlugin, Aop } from './util'
export { pluginPatch } from './patch'
export { getGlobalPlugin, getAllPlugin, Plugin } from './plugin'
