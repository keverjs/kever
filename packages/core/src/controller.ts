import { getMetadataStore, META_LOGGER, Container, construct } from '@kever/shared'
import type { ControllerMeta } from '@kever/shared'
import type { Logger } from './logger'

// eslint-disable-next-line @typescript-eslint/ban-types
const container = new Container<string, Function>()
/**
 * controller的标识，将修饰的类注册到controller container里
 * @param path
 */
export const Controller = (path = '/'): ClassDecorator => (constructor) => {
  if (container.has(path)) {
    const logger = getMetadataStore<Logger>(META_LOGGER)
    logger && logger.error(`${path} router already exists`)
    return constructor
  }
  container.bind(path, constructor)
  return constructor
}

export const getControllerMetas = () => {
  const controllerMetas = new Set<ControllerMeta>()
  const pool = container.getPool()
  for (const [path, constructor] of pool.entries()) {
    const controller = construct(constructor, [])
    controllerMetas.add({ path, controller })
  }
  return controllerMetas
}
