import * as Koa from 'koa'
import * as Router from 'koa-router'
import { RuntimeOptions } from '../../interface'
import {
  META_CONTROLLER,
  META_ROUTER
} from '../../constants'

function KoaRuntime(controllers: Set<any>, options:RuntimeOptions) {
  const app = new Koa()
  const router = new Router()
  const plugins: Array<Function> = options.plugins || []
  if(plugins.length) {
    for(let plugin of plugins){
      app.use(plugin)
    }
  }
  for(let controller of controllers) {
    console.log(controller)
    const rootPath = Reflect.getMetadata(META_CONTROLLER,controller.constructor)
    Object.getOwnPropertyNames(Object.getPrototypeOf(controller))
      .filter(name => name !== 'constructor')
      .forEach(name => {
        const metaRoute = Reflect.getMetadata(META_ROUTER,controller[name])
        if(metaRoute){
          const {method, path, beforePlugins, afterPlugins} = metaRoute
          router[method](`${rootPath}${path}`,...beforePlugins, async (ctx, next) => {
            await controller[name](ctx, next)
          }, ...afterPlugins)
        }
      })
  }
  app.use(router.routes()).use(router.allowedMethods())
  return app
}

export default KoaRuntime