import { Middleware } from 'koa'

export interface RuntimeOptionsInterface {
  plugins?: Array<Middleware>
}

export interface RouteAopInterface {
  before?: Array<Middleware>
  after?: Array<Middleware>
}

export interface RouteMetaInterface {
  methods: Array<string>
  path: string
  beforePlugins: Array<Middleware>
  afterPlugins: Array<Middleware>
}

export interface InjectInterface {
  propertyKey: string
  tag: symbol | string
}

export interface ControllerInterface {
  path: string
  constructor: any
}
