import * as Koa from 'koa'
import * as koaBody from 'koa-body'
import koaCookie from 'koa-cookie'

export const installMiddleware = (app: Koa, plugins: Array<Koa.Middleware>) => {
  if (plugins.length) {
    for (let plugin of plugins) {
      app.use(plugin)
    }
  }
  app.use(koaBody())
  app.use(koaCookie())
}
