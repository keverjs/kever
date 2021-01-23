import { Context, Next } from 'koa'
import { InstancePool, Tag } from '../instancePool'

export const enum PluginType {
  global,
  router,
  property,
}

export interface BasePlugin {
  ready(...args: any[]): any | Promise<any>
}

export const enum Aop {
  before,
  after,
}

export interface RouterInfo {
  [Aop.after]: Set<BasePlugin>
  [Aop.before]: Set<BasePlugin>
  raw: AsyncGeneratorFunction | Function
}

export interface PluginMetaType {
  type: PluginType
  instance: BasePlugin
  options?: any
}

export const pluginPool = new InstancePool<Tag, PluginMetaType>()
