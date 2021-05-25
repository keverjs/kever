import { logger } from '@kever/logger'
import { InstancePool, InstanceType, Tag } from '../instancePool'
import { PREFIX_HANDLERS } from './handlers'

type Getter<T extends object> = {
  // eslint-disable-next-line prettier/prettier
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K]
}

type Setter<T extends object> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void
}


type GSAccessor<T extends object> = Getter<T> & Setter<T>

interface ModelInstanceMethods<T extends object> {
  init<V extends T>(value: Partial<V> | JSON): void
  toJson(): JSON
  unproxy(): T & {__proxy__: ModelInstance<T>}
}

type ModelInstance<T extends object> = GSAccessor<T> & ModelInstanceMethods<T>

const modelPool = new InstancePool<Tag, Function>()

export const Model = (tag: Tag): ClassDecorator => {
  return (constructor) => {
    modelPool.bind(tag, constructor)
  }
}

Model.use = <T extends object>(tag: Tag): ModelInstance<T> => {
  const modelConstructor = modelPool.use(tag)
  if (!modelConstructor) {
    logger.error(`${tag.toString()} type model no exists`)
    return {} as ModelInstance<T>
  }
  const instance = new (modelConstructor as InstanceType)()
  const proxy = new Proxy(instance, {
    get(target, property: string, receiver) {
      let prefix: keyof typeof PREFIX_HANDLERS, key: string
      if (Object.keys(PREFIX_HANDLERS).includes(property)) {
        prefix = property as keyof typeof PREFIX_HANDLERS
      } else {
        const prefixTmp = property.slice(0, 3) as keyof typeof PREFIX_HANDLERS
        if (prefixTmp === 'set' || prefixTmp === 'get') {
          prefix = prefixTmp
          key = property
          .slice(3)
          .replace(/([A-Z])/, (match) => match.toLowerCase())
        }
      }

      return (value: unknown) => {
        if (target[prefix] && typeof target[prefix] === 'function') {
          return target[prefix](value)
        }
        if (PREFIX_HANDLERS[prefix] && typeof PREFIX_HANDLERS[prefix] === 'function') {
          return PREFIX_HANDLERS[prefix](target, key, value, receiver)
        }
      }
    },
  })
  instance.__proxy__ = proxy
  return proxy
}
