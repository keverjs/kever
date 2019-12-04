import { META_INJECT } from '../constants'
import { InjectInterface } from '../interface'

class InstancePoll {
  private injectablePoll: Map<symbol | string, any> = new Map()
  add(key: symbol | string, instance: any) {
    this.injectablePoll.set(key, instance)
  }
  has(key: symbol | string) {
    if (this.injectablePoll.has(key)) {
      return true
    }
    return false
  }
  get(key: symbol | string) {
    return this.injectablePoll.get(key)
  }
}

export const instancePoll: InstancePoll = new InstancePoll()

export const Injectable = (tag: symbol | string) => target => {
  instancePoll.add(tag, target)
}

export const Inject = (tag: symbol | string) => (
  target: any,
  propertyKey: string
) => {
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
