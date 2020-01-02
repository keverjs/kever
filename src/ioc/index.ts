import { META_INJECT } from '../constants'
import { InjectInterface } from '../interface'

type Tag = symbol | string

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
 *
 * @param tag
 */
export const Injectable = (tag: Tag) => target => {
  instancePoll.add(tag, target)
}

/**
 *
 * @param tag
 */
export const Inject = (tag: Tag) => (target: any, propertyKey: string) => {
  const injects: Array<InjectInterface> = Reflect.getMetadata(
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
