import { logger } from '@kever/logger'
import { InstancePool, InstanceType, Tag } from '../instancePool'

type Getter<T extends object> = {
  // eslint-disable-next-line prettier/prettier
  [K in keyof T & string as `get${Capitalize<K>}`]: () => T[K]
}

type Setter<T extends object> = {
  [K in keyof T & string as `set${Capitalize<K>}`]: (value: T[K]) => void
}


type GS<T extends object> = Getter<T> & Setter<T>

const modelPool = new InstancePool<Tag, Function>()

export const Model = (tag: Tag): ClassDecorator => {
  return (constructor) => {
    modelPool.bind(tag, constructor)
  }
}

Model.use = <T extends object>(tag: Tag): GS<T> => {
  const modelConstructor = modelPool.use(tag)
  if (!modelConstructor) {
    logger.error(`${tag.toString()} type model no exists`)
    return {} as GS<T>
  }
  const instance = new (modelConstructor as InstanceType)()
  const proxy = new Proxy(instance, {
    get(target, property: string, receiver) {
      const prefix = property.slice(0, 3)
      const key = property
        .slice(3)
        .replace(/([A-Z])/, (match) => match.toLowerCase())

      return (value: unknown) => {
        console.log('taget', target)
        if (prefix === 'get') {
          return Reflect.get(target, key, receiver)
        }
        if (prefix === 'set') {
          Reflect.set(target, key, value, receiver)
        }
      }
    },
  })
  return proxy
}
