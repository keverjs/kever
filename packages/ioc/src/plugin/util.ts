import { InstancePool, Tag } from '../instancePool'

export const enum PluginType {
  global,
  route,
  property,
}

export interface BasePlugin {
  ready(...args: any[]): unknown
  ready(...args: any[]): Promise<unknown>
}

export const enum AopRoute {
  before,
  after,
}

export interface RoutePluginInfoType {
  [AopRoute.after]: Set<BasePlugin>
  [AopRoute.before]: Set<BasePlugin>
  raw: AsyncGeneratorFunction | Function
}

export interface PluginMetaType {
  type: PluginType
  instance: BasePlugin
  options?: any
}

export const pluginPool = new InstancePool<Tag, PluginMetaType>()
