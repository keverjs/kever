import type { Logger } from '@kever/core'
import {
  construct,
  Container,
  Tag,
  Instance,
  poolContainer,
  isBoolean,
  META_LOGGER,
  getMetadataStore
} from '@kever/shared'

const injectContainer = new Container<Tag, Instance>()

/**
 * Marks the current class as injectable
 * @param tag
 */
export const Injectable = (tag: Tag): ClassDecorator => (target) => {
  const injectMeta = injectContainer.use(tag)
  if (injectMeta) {
    const logger = getMetadataStore<Logger>(META_LOGGER)
    logger.error(` ${tag.toString()} model existence`)
    return
  }
  injectContainer.bind(tag, target as unknown as Instance)
  return target
}

/**
 * @description DI
 * @param tag
 */
export const Inject = <T>(tag: Tag, unNew = false, param?: T): PropertyDecorator => (target, propertyKey) => {
  let pool = poolContainer.use(target)
  if (isBoolean(pool)) {
    pool = new Container<PropertyKey, unknown>()
  }
  pool.bind(propertyKey, undefined)
  poolContainer.bind(target, pool)

  injectContainer.on(tag, (instance) => {
    if (!instance) {
      const logger = getMetadataStore<Logger>(META_LOGGER)
      logger.error(` ${tag.toString()} injectable model not existence`)
      return
    }
    let value = !unNew ? construct(instance, Array.isArray(param) ? param : [param]) : instance
    if (!isBoolean(pool)) {
      pool.bind(propertyKey, value)
    }
  })
}
