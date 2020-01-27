import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import koaCookie from 'koa-cookie'
import { Tag } from '../../../types/index'
const Logger = console
export const installMiddleware = (app: Koa, middles: Set<Koa.Middleware>) => {
  app.use(koaBody())
  app.use(koaCookie())
  for (let middle of middles) {
    app.use(middle)
  }
}

/**
 * @description 基础的中间件接口，所有的中间件都要继承这个东西
 */
export interface BaseMiddle {
  ready(ctx: Koa.Context, next: Koa.Next): Promise<void>
}

interface MiddlePoll<T> {
  routeMiddle: Map<Tag, T>
  globalMiddle: Map<Tag, T>
}
export const middlePoll: MiddlePoll<Koa.Middleware> = {
  routeMiddle: new Map(),
  globalMiddle: new Map()
}

type registerMiddleType = (
  tag: Tag
) => <T extends { new (...args: any[]): {} }>(target: T) => void

export const registerMiddle: registerMiddleType = (tag: Tag) => target => {
  const instance: BaseMiddle = new target() as BaseMiddle
  if (middlePoll.routeMiddle.has(tag)) {
    Logger.error(`[kever|err]: ${String(tag)} middleware Registered`)
  } else {
    middlePoll.routeMiddle.set(tag, instance.ready.bind(instance))
  }
}

export const registerGlobalMiddle: registerMiddleType = (
  tag: Tag
) => target => {
  const instance: BaseMiddle = new target() as BaseMiddle
  if (middlePoll.globalMiddle.has(tag)) {
    Logger.error(`[kever|err]: ${String(tag)} middleware Registered`)
  } else {
    middlePoll.globalMiddle.set(tag, instance.ready.bind(instance))
  }
}
