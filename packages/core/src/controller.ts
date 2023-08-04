import { getMetadataStore, META_LOGGER } from '@kever/shared'
import type { Logger } from './logger'
export const controllerPool = new Map<string, Function>()
/**
 * controller的标识，将修饰的类注册到controller poll里
 * @param path
 */
export const Controller = (path = '/'): ClassDecorator => (constructor) => {
  if (controllerPool.has(path)) {
    const logger = getMetadataStore<Logger>(META_LOGGER)
    if (logger) {
      logger.error(`${path} router already exists`)
    }
    return constructor
  }
  controllerPool.set(path, constructor)
  return constructor
}
