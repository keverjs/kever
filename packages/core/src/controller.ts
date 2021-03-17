import Koa from 'koa'
import { logger } from '@kever/logger'

export const META_CONTROLLER = Symbol.for('core#meta_controller')
export const controllerPoll = new Map<string, Function>()
/**
 * controller的标识之一，将修饰的类注册到controller poll里
 * @param path
 */
export const Controller = (path = '/'): ClassDecorator => (constructor) => {
  if (controllerPoll.has(path)) {
    logger.error(`${path} router already exists`)
    return constructor
  }
  controllerPoll.set(path, constructor)
  return constructor
}

/**
 * @description controller的基础可继承类，继承自Koa。
 */
export class BaseController {
  /**
   * @description 使用继承的方式显示的让每一个controller可以从实例上获取到ctx和next
   */
  public ctx: Koa.Context
  public next: Koa.Next
  /**
   * @description controller继承baseController的标识
   */
  public _isExtends = Symbol.for('BaseController#isExtends')
}
BaseController.prototype._isExtends = Symbol.for('BaseController#isExtends')
