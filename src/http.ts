import 'reflect-metadata'
import {
  META_ROUTER,
  META_HTTP_METHOD
} from './constants'

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
    Reflect.defineMetadata(META_ROUTER,{
      method,
      path
    },descripator.value)
  }
}

