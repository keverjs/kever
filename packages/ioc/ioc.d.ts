export declare const enum AopRoute {
  before = 0,
  after = 1,
}

export declare interface BasePlugin {
  ready(...args: any[]): unknown
  ready(...args: any[]): Promise<unknown>
}

export declare const getGlobalPlugin: () => Function[]

export declare const Inject: InjectDecoratorType

export declare const Injectable: InjectableDecoratorType

declare type InjectableDecoratorType = (tag: Tag) => ClassDecorator

declare type InjectDecoratorType = (
  tag: Tag,
  payload?: {
    params?: any
  }
) => PropertyDecorator

export declare const pluginPatch: (tag: Tag, payload: any | Function) => void

export declare const enum PluginType {
  global = 0,
  route = 1,
  property = 2,
}

declare type PropertyPluginType = (
  tag: Tag,
  payload?: {
    params?: any
  }
) => PropertyDecorator | void

export declare const registerPlugin: RegisterPluginType

declare type RegisterPluginType = (tag: Tag, type: PluginType) => ClassDecorator

declare type RoutePluginType = <T>(
  tag: Tag,
  type: AopRoute,
  payload?: {
    params?: any
  }
) => MethodDecorator | void

declare type Tag = string | symbol

export declare const usePropertyPlugin: PropertyPluginType

export declare const useRoutePlugin: RoutePluginType

export {}
