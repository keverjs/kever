import Router from 'koa-router'

export declare const All: (path: string) => MethodDecorator

export declare interface ControllerMetaType {
  path: string
  controller: Object
}

export declare const Delete: (path: string) => MethodDecorator

export declare const Get: (path: string) => MethodDecorator

export declare const Head: (path: string) => MethodDecorator

export declare const META_ROUTER: unique symbol

declare type Methods =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'

export declare const Options: (path: string) => MethodDecorator

export declare function parseRouter(
  controllerMetas: ControllerMetaType[]
): Router

export declare const Patch: (path: string) => MethodDecorator

export declare const Post: (path: string) => MethodDecorator

export declare const Put: (path: string) => MethodDecorator

export declare interface RouterMetadata {
  methods: Methods[]
  path: string
}

export {}
