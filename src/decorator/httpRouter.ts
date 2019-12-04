import { META_ROUTER } from '../constants'
import { RouteAopInterface } from '../interface'
import { Middleware } from 'koa'
// create http request method decorator
/**
 *
 */
export const Get = createHTTPMethodDecorator('get')
/**
 *
 */
export const Post = createHTTPMethodDecorator('post')
/**
 *
 */
export const Put = createHTTPMethodDecorator('put')
/**
 *
 */
export const Delete = createHTTPMethodDecorator('delete')
/**
 *
 */
export const All = createHTTPMethodDecorator('get', 'post', 'put', 'delete')

/**
 *
 * @param methods
 */
function createHTTPMethodDecorator(...methods: Array<string>): Function {
  return (path: string, aopPlugins: RouteAopInterface = {}) => (
    target: any,
    propertyKey: string,
    descripator: PropertyDescriptor
  ) => {
    let beforePlugins: Set<Middleware> = new Set()
    let afterPlugins: Set<Middleware> = new Set()
    const before: Array<Middleware> = aopPlugins.before
    const after: Array<Middleware> = aopPlugins.after
    if (before) {
      for (let plugin of before) {
        beforePlugins.add(plugin)
      }
    }
    if (after) {
      for (let plugin of after) {
        afterPlugins.add(plugin)
      }
    }
    Reflect.defineMetadata(
      META_ROUTER,
      {
        methods,
        path,
        beforePlugins,
        afterPlugins
      },
      descripator.value
    )
  }
}
