
import {
  META_PROVIDE,
  META_INJECT,
} from '../constants'

interface InstanceMeta {
  key: symbol;
  value: (new () => {})
}

class InstancePoll {
  private providePoll: Map<any, any> = new Map();
  private injectPoll: Map<any, any> = new Map();
  add(type: Symbol, instanceMeta: InstanceMeta) {
    if(type === META_PROVIDE) {
      console.log(instanceMeta)
      this.providePoll.set(instanceMeta.key, instanceMeta.value)
    }
    if(type === META_INJECT) {
      this.injectPoll.set(instanceMeta.value, instanceMeta.key)

    }
  }
  has(type: Symbol, key: any) {
    if(type === META_PROVIDE) {
      if(this.providePoll.has(key)) {
        return true
      }
      return false
    } else {
      if(this.injectPoll.has(key)) {
        return true
      }
      return false
    }
  }
  get(type: Symbol, key: any) {
    if(type === META_PROVIDE) {
      return this.providePoll.get(key)
    } else {
      return this.injectPoll.get(key)
    }
  }
  getAll(type: Symbol) {
    if(type === META_PROVIDE) {
      return this.providePoll
    } else {
      return this.injectPoll
    }
  }
}

export const instancePoll = new InstancePoll()



export const Provide = createIocDecorator(META_PROVIDE)
export const Inject = createIocDecorator(META_INJECT)


function createIocDecorator(type) {
  return (tag) => target => {
    instancePoll.add(type, {
      key:tag,
      value: target
    })
  }
}