import { META_ROUTER } from '../constants'
import { RouteAop } from '../types'
import { Middleware } from 'koa'
// create http request method decorator
/**
 * @description get router
 */
export const Get = createHTTPMethodDecorator('get')
/**
 * @description post router
 */
export const Post = createHTTPMethodDecorator('post')
/**
 * @description put router
 */
export const Put = createHTTPMethodDecorator('put')
/**
 *  @description delete router
 */
export const Delete = createHTTPMethodDecorator('delete')
/**
 * @description all router
 */
export const All = createHTTPMethodDecorator('get', 'post', 'put', 'delete')

/**
 * @description 路由装饰器生成器
 * @param methods
 */
type HttpMethodReturnType = (
  path: string,
  aopPlugins?: RouteAop
) => MethodDecorator
function createHTTPMethodDecorator(
  ...methods: Array<string>
): HttpMethodReturnType {
  return (path, aopPlugins = {}): MethodDecorator => (
    target,
    propertyKey,
    descripator
  ) => {
    let beforePlugins: Set<Middleware> = new Set()
    let afterPlugins: Set<Middleware> = new Set()
    const before = aopPlugins.before
    const after = aopPlugins.after
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
