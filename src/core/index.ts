import { instancePoll } from '../ioc'
import { META_INJECT, META_CONTROLLER } from '../constants'
import { RuntimeOptions } from '../interface'
import KoaRuntime from '../runtime/koa'
import * as Koa from 'koa'

const CONTROLLER_POLL = Object.create(null)
export const createApplication = (options: RuntimeOptions = {}) => {
  const controllers: Set<any> = new Set()
  const controllerPoll: any = Reflect.getMetadata(
    META_CONTROLLER,
    CONTROLLER_POLL
  )

  for (let controllerMeta of controllerPoll) {
    const { path, constructor } = controllerMeta
    const injects = Reflect.getMetadata(META_INJECT, constructor)
    const injectParams = []
    if (injects) {
      for (let inject of injects) {
        const { index, tag } = inject
        const injectable: new () => {} = instancePoll.get(tag)
        if (injectable) {
          injectParams[index] = new injectable()
        } else {
          throw new Error(`not ${tag} model is injectable`)
        }
      }
    }
    const controller = new constructor(...injectParams)
    controllers.add({
      controller,
      path
    })
  }
  const app = KoaRuntime(controllers, options)
  return app
}

export const Controller = (path: string = '/') => {
  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    const controllerPoll = Reflect.getMetadata(META_CONTROLLER, CONTROLLER_POLL)
    if (controllerPoll) {
      Reflect.defineMetadata(
        META_CONTROLLER,
        controllerPoll.concat([
          {
            path,
            constructor
          }
        ]),
        CONTROLLER_POLL
      )
    } else {
      Reflect.defineMetadata(
        META_CONTROLLER,
        [
          {
            path,
            constructor
          }
        ],
        CONTROLLER_POLL
      )
    }
    return constructor
  }
}
