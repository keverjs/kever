import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import koaCookie from 'koa-cookie'
import { Tag } from '../../../types/index'

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
  ready(): void
}

interface MiddlePoll<T> {
  routeMiddle: Map<Tag, T>
  golbalMiddle: Set<T>
}
export const middlePoll: MiddlePoll<Koa.Middleware> = {
  routeMiddle: new Map(),
  golbalMiddle: new Set()
}

type registerMiddleType = (
  tag: Tag
) => <T extends { new (...args: any[]): {}; ready(): void }>(target: T) => void

export const registerMiddle: registerMiddleType = (tag: Tag) => target => {
  const instance: BaseMiddle = new target() as BaseMiddle
  middlePoll.routeMiddle.set(tag, instance.ready)
}

export const registerGlobalMiddle: registerMiddleType = (
  tag: Tag
) => target => {
  const instance: BaseMiddle = new target() as BaseMiddle
  middlePoll.golbalMiddle.add(instance.ready)
}
