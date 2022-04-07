import { logger } from '@kever/logger'
import { InstancePool } from './instancePool'
import { construct, defineProperty, InstanceType, Tag } from './utils'

const InjectPool = new InstancePool<Tag, InstanceType>()

/**
 * @description 标记当前类是可注入的
 * @param tag
 */
export const Injectable =
  (tag: Tag): ClassDecorator =>
  (target) => {
    const injectMeta = InjectPool.use(tag)
    if (injectMeta) {
      logger.error(` ${tag.toString()} model existence`)
      return
    }
    InjectPool.bind(tag, target as unknown as InstanceType)
    return target
  }

/**
 * @description 注入类
 * @param tag
 */
export const Inject =
  <T>(tag: Tag, unNew = false, param?: T): PropertyDecorator =>
  (target, propertyKey) => {
    InjectPool.on(tag, (instance) => {
      if (!instance) {
        logger.error(` ${tag.toString()} injectable model not existence`)
        return
      }
      let value = instance
      if (!unNew) {
        let parameter: unknown[]
        if (Array.isArray(param)) {
          parameter = param
        } else {
          parameter = [param]
        }
        value = construct(instance, parameter)
      }
      defineProperty(target, propertyKey, value)
    })
  }
