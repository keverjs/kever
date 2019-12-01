import { META_INJECT } from '../constants'

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

export const instancePoll = new InstancePoll()

export const Injectable = tag => target => {
  instancePoll.add(tag, target)
}

export const Inject = tag => (
  target: any,
  propertyKey: string,
  index: number
) => {
  let paramsTypes: Function[] = Reflect.getMetadata('design:paramtypes', target)
  if (paramsTypes.length) {
    for (let param of paramsTypes) {
      if (param === target) {
        throw new Error('not dependencies self')
      }
    }
  }
  const injects = Reflect.getMetadata(META_INJECT, target)
  if (injects) {
    Reflect.defineMetadata(
      META_INJECT,
      injects.concat([
        {
          index,
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
          index,
          tag
        }
      ],
      target
    )
  }
}
