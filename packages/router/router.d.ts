import Router from 'koa-router'

export declare const All: HttpDecoratorType

export declare interface ControllerMetaType {
  path: string
  controller: object
}

export declare const Delete: HttpDecoratorType

export declare const Get: HttpDecoratorType

export declare const Head: HttpDecoratorType

declare type HttpDecoratorType = (path: string) => MethodDecorator

export declare const META_ROUTER: unique symbol

declare type Methods =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'head'
  | 'options'
  | 'patch'

export declare const Options: HttpDecoratorType

export declare function parseRouter(
  controllerMetas: ControllerMetaType[]
): Router

export declare const Patch: HttpDecoratorType

export declare const Post: HttpDecoratorType

export declare const Put: HttpDecoratorType

export declare interface RouterMetadataType {
  methods: Methods[]
  path: string
}

export {}
