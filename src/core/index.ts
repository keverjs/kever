import {instancePoll} from '../ioc'
import {
  META_INJECT,
  META_PROVIDE
} from '../constants'
import * as Koa from 'koa'
import {
  META_CONTROLLER
} from '../constants'

export const createApplication = () => {
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
  const app = new Koa();

  for(let controller of controllers) {
    app.use(controller.getUser.bind(controller))
  }
  
  return app
}

export const Controller = (path: string = '/') => {
  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    Reflect.defineMetadata(META_CONTROLLER, path, constructor)
    return constructor
  }
}