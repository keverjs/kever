import {
  META_ROUTER,
} from '../constants'
import { RouteAop } from '../interface'
// create http request method decorator
export const Get = createHTTPMethodDecorator('get')
export const Post = createHTTPMethodDecorator('post')
export const Put = createHTTPMethodDecorator('put')
export const Delete = createHTTPMethodDecorator('delete')


function createHTTPMethodDecorator(method: string) {
  return (path: string, aopPlugins: RouteAop = {}) => (
    target: any,
    propertyKey: string,
    descripator: PropertyDescriptor
  ) => {
    let beforePlugins: Set<Function> = new Set();
    let afterPlugins: Set<Function> = new Set();
    const before = aopPlugins.before
    const after = aopPlugins.after
    if(before) {
      for(let plugin of before) {
        beforePlugins.add(plugin)
      }
    }
    if(after) {
      for(let plugin of after) {
        afterPlugins.add(plugin)
      }
    }
    Reflect.defineMetadata(META_ROUTER,{
      method,
      path,
      beforePlugins,
      afterPlugins
    },descripator.value)
  }
}

