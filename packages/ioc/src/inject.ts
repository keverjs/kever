import { logger } from '@kever/logger'
import { construct, defineProperty } from './utils'
import { Tag } from './utils/types'

export const META_INJECT = Symbol.for('ioc#meta_inject')

/**
 * @description 标记当前类是可注入的
 * @param tag
 */
export const Injectable =
  (tag: Tag): ClassDecorator =>
  (target) => {
    const injectMeta = Reflect.getMetadata(META_INJECT, tag)
    if (injectMeta) {
      logger.error(` ${tag.toString()} model existence`)
      return
    }
    Reflect.defineMetadata(META_INJECT, target, tag)
    return target
  }

/**
 * @description 注入类
 * @param tag
 */
export const Inject =
  <T>(tag: Tag, unNew = false, param?: T): PropertyDecorator =>
  (target, propertyKey) => {
    const injectMeta = Reflect.getMetadata(META_INJECT, tag)
    if (!injectMeta) {
      logger.error(` ${tag.toString()} injectable model not existence`)
      return
    }
    let value = injectMeta
    if (!unNew) {
      let parameter: unknown[]
      if (Array.isArray(param)) {
        parameter = param
      } else {
        parameter = [param]
      }
      value = construct(injectMeta, parameter)
    }
    defineProperty(target, propertyKey, value)
  }
