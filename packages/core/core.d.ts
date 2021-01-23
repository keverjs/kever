import { Context } from 'koa'
import Koa from 'koa'
import * as Koa_2 from 'koa'
import { Next } from 'koa'

export declare class BaseController {
  ctx: Koa.Context
  next: Koa.Next
  _isExtends: symbol
}
export { Context }

export declare const Controller: ControllerType

export declare const controllerPoll: Map<string, Function>

declare type ControllerType = (path?: string) => ClassDecorator

export declare const createApplication: CreateApplicationType

declare type CreateApplicationType = (
  options?: OptionsType,
  callback?: (app: Koa_2) => void
) => Promise<void>

export declare const META_CONTROLLER: unique symbol
export { Next }

export declare interface OptionsType {
  hostname?: string
  port?: number
  plugins?: string[]
  env?: string
  tsconfig?: string
}

export {}
