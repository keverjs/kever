import { instancePoll } from '../ioc'
import { META_INJECT, META_CONTROLLER } from '../constants'
import {
  RuntimeOptionsInterface,
  InjectInterface,
  ControllerInterface
} from '../interface'
import KoaRuntime from '../runtime/koa'
import * as Koa from 'koa'

/**
 *
 */
const CONTROLLER_POLL = Object.create(null)

/**
 *
 * @param options
 */
export const createApplication = (
  options: RuntimeOptionsInterface = {}
): Koa => {
  const controllers: Set<any> = new Set()
  const controllerPoll: Array<ControllerInterface> = Reflect.getMetadata(
    META_CONTROLLER,
    CONTROLLER_POLL
  )

  for (let controllerMeta of controllerPoll) {
    const { path, constructor } = controllerMeta
    const controller: any = new constructor()
    if (!('_isExtends' in controller)) {
      throw new Error(`class ${constructor.name} not extends BaseController`)
    }
    const injects: Array<InjectInterface> = Reflect.getMetadata(
      META_INJECT,
      controller
    )
    if (injects) {
      for (let inject of injects) {
        const { propertyKey, tag } = inject
        const injectable: new () => {} = instancePoll.get(tag)
        if (injectable) {
          Object.defineProperty(controller, propertyKey, {
            value: new injectable(),
            writable: false,
            configurable: false,
            enumerable: true
          })
        } else {
          throw new Error(`not ${String(tag)} model is injectable`)
        }
      }
    }

    controllers.add({
      controller,
      path
    })
  }
  const app: Koa = KoaRuntime(controllers, options)
  return app
}
/**
 *
 * @param path
 */
export const Controller = (path: string = '/'): Function => {
  return function<T extends { new (...args: any[]): {} }>(constructor: T) {
    const controllerPoll: Array<ControllerInterface> = Reflect.getMetadata(
      META_CONTROLLER,
      CONTROLLER_POLL
    )
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
