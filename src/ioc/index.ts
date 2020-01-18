import { META_INJECT } from '../constants'
import { InjectMetaType, Tag } from '../types'

/**
 *
 */
class InstancePoll {
  private injectablePoll: Map<Tag, any> = new Map()
  add(key: Tag, instance: any) {
    this.injectablePoll.set(key, instance)
  }
  has(key: Tag) {
    if (this.injectablePoll.has(key)) {
      return true
    }
    return false
  }
  get(key: Tag) {
    return this.injectablePoll.get(key)
  }
}

export const instancePoll = new InstancePoll()

/**
 * @description 标记类时可注入的
 * @param tag
 */
type InjectableType = (tag: Tag) => ClassDecorator
export const Injectable: InjectableType = tag => target => {
  instancePoll.add(tag, target)
}

/**
 *
 * @param tag
 */
type InjectType = (tag: Tag) => PropertyDecorator
export const Inject: InjectType = tag => (target, propertyKey) => {
  const injects: Array<InjectMetaType> = Reflect.getMetadata(
    META_INJECT,
    target
  )
  if (injects) {
    Reflect.defineMetadata(
      META_INJECT,
      injects.concat([
        {
          propertyKey,
          tag
        }
      ]),
      target
    )
  } else {
    Reflect.defineMetadata(
      META_INJECT,
      [
        {
          propertyKey,
          tag
        }
      ],
      target
    )
  }
}
