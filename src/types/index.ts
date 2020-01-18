import { Middleware } from 'koa'

export type Tag = symbol | string
export type RuntimeOptions = Partial<Record<'plugins', Array<Middleware>>>
export type RouteAop = Partial<Record<'before' | 'after', Array<Middleware>>>
export type InjectMetaType = Record<'propertyKey' | 'tag', Tag>

export interface RouteMetaInterface {
  methods: Array<string>
  path: string
  beforePlugins: Array<Middleware>
  afterPlugins: Array<Middleware>
}

export interface ControllerInterface {
  path: string
  constructor: any
}

export interface ParamsMetaInterface {
  index: number
  tags: Array<string>
}
