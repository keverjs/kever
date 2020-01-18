import { instancePoll } from '../ioc'
import { META_INJECT, META_CONTROLLER } from '../constants'
import { RuntimeOptions, InjectMetaType, ControllerInterface } from '../types'
import KoaRuntime from '../runtime/koa'
import * as Koa from 'koa'

/**
 * @description controller poll，所有的controller都会注册到这里，在创建服务的时候获取到。
 */
const CONTROLLER_POLL = Object.create(null)

/**
 * @description 初始化所有的controller并将service注入去调用KoaRuntime启动服务。
 * @param options
 */
type CreateApplicationType = (options: RuntimeOptions) => Koa
export const createApplication: CreateApplicationType = (options = {}) => {
  const controllers: Set<any> = new Set()
  const controllerPoll: Array<ControllerInterface> =
    Reflect.getMetadata(META_CONTROLLER, CONTROLLER_POLL) || []
  // 遍历所有的controller，并获取到依赖的service。
  for (let controllerMeta of controllerPoll) {
    const { path, constructor } = controllerMeta
    const controller = new constructor()
    if (!('_isExtends' in controller)) {
      throw new Error(`class ${constructor.name} not extends BaseController`)
    }
    const injects: Array<InjectMetaType> =
      Reflect.getMetadata(META_INJECT, controller) || []
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

    controllers.add({
      controller,
      path
    })
  }
  // 调用KoaRuntime启动服务
  const app = KoaRuntime(controllers, options)
  return app
}
/**
 * controller的标示之一，将修饰的类注册到controller poll里
 * @param path
 */
export const Controller = (path: string = '/'): ClassDecorator => {
  return function(constructor) {
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
