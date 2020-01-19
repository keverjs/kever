import { META_ROUTER } from '../constants'
import { RouteAop, Tag } from '../types'
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
  aopMiddles?: RouteAop
) => MethodDecorator
function createHTTPMethodDecorator(
  ...methods: Array<string>
): HttpMethodReturnType {
  return (path, aopMiddles = {}): MethodDecorator => (
    target,
    propertyKey,
    descripator
  ) => {
    let beforeMiddlesType: Array<Tag> = aopMiddles.before || []
    let afterMiddlesType: Array<Tag> = aopMiddles.after || []
    Reflect.defineMetadata(
      META_ROUTER,
      {
        methods,
        path,
        beforeMiddlesType,
        afterMiddlesType
      },
      descripator.value
    )
  }
}
