import {
  META_ROUTER,
} from '../constants'

// create http request method decorator
export const Get = createHTTPMethodDecorator('get')
export const Post = createHTTPMethodDecorator('post')
export const Put = createHTTPMethodDecorator('put')
export const Delete = createHTTPMethodDecorator('delete')


function createHTTPMethodDecorator(method: string) {
  return (path: string) => (
    target: any,
    propertyKey: string,
    descripator: PropertyDescriptor
  ) => {
    let plugins: Set<AsyncGeneratorFunction> = new Set();
    for(let i = 1; i < arguments.length; i ++) {
      plugins.add(arguments[i])
    }
    Reflect.defineMetadata(META_ROUTER,{
      method,
      path,
      plugins
    },descripator.value)
  }
}

