import {instancePoll} from '../ioc'
import {
  META_INJECT,
  META_PROVIDE,
  META_CONTROLLER
} from '../constants'
import { RuntimeOptions } from '../interface'
import KoaRuntime from '../runtime/koa'

export const createApplication = (options: RuntimeOptions = {}) => {
  const controllers: Set<any> = new Set();
  const controllerPoll: Map<any, any> = instancePoll.getAll(META_INJECT)
  for(let [Controller, tag] of controllerPoll) {
    if(instancePoll.has(META_PROVIDE,tag)) {
      const injectableModel: (new () => {}) = instancePoll.get(META_PROVIDE,tag)
      const controller = new Controller(new injectableModel())
      controllers.add(controller)
    } else {
      throw new Error(`not ${tag} model is injectable`)
    }
    
  }
  const app = KoaRuntime(controllers, options)
  return app
}

export const Controller = (path: string = '/') => {
  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    console.log(constructor)
    Reflect.defineMetadata(META_CONTROLLER, path, constructor)
    return constructor
  }
}