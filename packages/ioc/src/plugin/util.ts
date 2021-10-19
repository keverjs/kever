import { InstancePool, Tag } from '../instancePool'
import { Middleware, Context, Next } from 'koa'

export const enum PluginType {
  Global,
  Router,
  Property,
}

type BasePluginReadyParams<T> = T extends PluginType.Property
  ? []
  : T extends PluginType.Router
  ? [Middleware, unknown]
  : T extends PluginType.Global
  ? [Context, Next]
  : never

type BasePluginReadyReturn<T> = T extends PluginType.Property
  ? unknown | Promise<unknown>
  : T extends PluginType.Router
  ? Middleware
  : T extends PluginType.Global
  ? void
  : never

export interface BasePlugin<T extends PluginType> {
  ready(...args: BasePluginReadyParams<T>): BasePluginReadyReturn<T>
  destory?: () => void
}

export const enum Aop {
  Before,
  After,
  Duplex,
}

export interface GolbalPluginMeta {
  type: PluginType.Global
  instance: BasePlugin<PluginType.Global>
}
export interface RouterPluginMeta {
  type: PluginType.Router
  instance: BasePlugin<PluginType.Router>
}
export interface PropertyPluginMeta {
  type: PluginType.Property
  instance: BasePlugin<PluginType.Property>
  payload: unknown
}

export const pluginPool = new InstancePool<
  Tag,
  GolbalPluginMeta | RouterPluginMeta | PropertyPluginMeta
>()

interface RouterAopInfo {
  [Aop.After]: Set<Middleware>
  [Aop.Before]: Set<Middleware>
  propertyKey: Tag
  target: Object
}

export const routerPool = new InstancePool<string, RouterAopInfo>()

export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
