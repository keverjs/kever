import { Context } from 'koa'
import * as Koa from 'koa'
import { Middleware } from 'koa'
import { Next } from 'koa'

declare interface AppOption {
  host?: string
  port?: number
  middlewares?: (string | Middleware)[]
  modulePath?: []
  env?: string
  tsconfig?: string
}

declare type Callback = (app: Koa) => void

export { Context }

export declare const Controller: (path?: string) => ClassDecorator

export declare const controllerPoll: Map<string, Function>

export declare const createApp: (
  options: AppOption,
  callback?: Callback | undefined
) => Promise<void>

export declare const META_CONTROLLER: unique symbol

export { Next }

export {}
