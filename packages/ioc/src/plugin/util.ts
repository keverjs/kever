import { InstancePool, Tag } from '../instancePool'

export const enum PluginType {
  Global,
  Router,
  Property,
}

export interface BasePlugin {
  ready(...args: any[]): any | Promise<any>
}

export const enum Aop {
  Before,
  After,
  Duplex,
}

export interface RouterInfo {
  [Aop.After]: Set<BasePlugin>
  [Aop.Before]: Set<BasePlugin>
  raw: AsyncGeneratorFunction | Function
}

export interface PluginMetaType {
  type: PluginType.Global | PluginType.Router
  instance: BasePlugin
  options?: any
}

export interface PropertyPluginMetaType {
  type: PluginType.Property
  instance: unknown
  options?: any
}

export const pluginPool = new InstancePool<
  Tag,
  PluginMetaType | PropertyPluginMetaType
>()

export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
