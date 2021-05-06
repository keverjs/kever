import { logger } from '@kever/logger'
import { InstancePool, InstanceType, Tag } from '../instancePool'

type Getter<T extends object> = {
  // eslint-disable-next-line prettier/prettier
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K]
}

type Setter<T extends object> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void
}


type GSAccessor<T extends object> = Getter<T> & Setter<T>

interface ModelInstanceMethods<T extends object> {
  init<V extends T>(value: V | string): void
  toJson(): string
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
      let prefix: string, key: string
      if (property === 'init' || property === 'toJson') {
        prefix = property
      } else {
        prefix = property.slice(0, 3)
        key = property
          .slice(3)
          .replace(/([A-Z])/, (match) => match.toLowerCase())
      } 

      return (value: unknown) => {
        if (prefix === 'get') {
          return Reflect.get(target, key, receiver)
        }
        if (prefix === 'set') {
          Reflect.set(target, key, value, receiver)
        }
        if (prefix === 'toJson') {
          return JSON.stringify(target)
        }
        if (prefix === 'init') {
          let object = value as Record<string, unknown>
          if (typeof value === 'string') {
            object = JSON.parse(value)
          }
          Object.keys(object).forEach(key => {
            Reflect.set(target, key, object[key], receiver)
          })
        }
      }
    },
  })
  return proxy
}
