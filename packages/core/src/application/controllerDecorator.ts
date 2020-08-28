import { logger } from '@kever/logger'

type ControllerType = (path?: string) => ClassDecorator

export const META_CONTROLLER = Symbol.for('core#meta_controller')
export const controllerPoll = new Map<string, Function>()
/**
 * controller的标示之一，将修饰的类注册到controller poll里
 * @param path
 */
export const Controller: ControllerType = (path = '/') => (constructor) => {
  if (controllerPoll.has(path)) {
    logger.error(`${path} router already exists`)
    return constructor
  }
  controllerPoll.set(path, constructor)
  return constructor
}
