import { Middleware } from 'koa'

export type Tag = symbol | string
export type RuntimeOptions = Partial<Record<'plugins', Array<Middleware>>>
export type RouteAop = Partial<Record<'before' | 'after', Array<Tag>>>
export type InjectMetaType = Record<'propertyKey' | 'tag', Tag>

export interface RouteMetaInterface {
  methods: Array<string>
  path: string
  beforeMiddlesType: Array<Tag>
  afterMiddlesType: Array<Tag>
}

export interface ControllerInterface {
  path: string
  constructor: any
}

export interface ParamsMetaInterface {
  index: number
  tags: Array<string>
}
