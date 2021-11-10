import { logger } from '@kever/logger'
import { constructInjectProperty } from '../construct'
import { InstancePool, Tag } from '../instancePool'

type NonFuncntion<T> = T extends Function ? true : false

type FunctionKeys<T extends object> = {
  [K in keyof T]: NonFuncntion<T[K]> extends true ? K : never
}[keyof T]

type FilterNonFunction<
  T extends object,
  Keys extends keyof T = FunctionKeys<T>
> = Pick<T, Keys>

type ModelInstance<T extends object> = FilterNonFunction<T>

const modelProps = new Map<object, (string | symbol)[]>()
export const Prop = (): PropertyDecorator => {
  return (target, property) => {
    let props = modelProps.get(target)
    if (props && Array.isArray(props)) {
      props.push(property)
    } else {
      props = [property]
    }
    modelProps.set(target, props)
  }
}

const modelPool = new InstancePool<Tag, Function>()

export const Model = (tag: Tag): ClassDecorator => {
  return (constructor) => {
    modelPool.bind(tag, constructor)
  }
}

Model.use = <T extends object>(tag: Tag): ModelInstance<T> => {
  const modelConstructor = modelPool.use(tag)
  if (typeof modelConstructor === 'boolean') {
    logger.error(`${tag.toString()} type model no exists`)
    return {} as ModelInstance<T>
  }
  const instance = constructInjectProperty(modelConstructor, [])
  Object.defineProperty(instance, 'toJSON', {
    value: function () {
      const props = modelProps.get(Object.getPrototypeOf(this))
      if (props && Array.isArray(props)) {
        return partShadowClone(this, props)
      }
      return this
    },
    writable: false,
    enumerable: false,
  })
  return instance
}

function partShadowClone<T extends object, K extends keyof T>(
  target: T,
  props: K[]
) {
  const cloneTarget = Object.create(null)
  for (let key in target) {
    if (target.hasOwnProperty(key) && props.includes((key as unknown) as K)) {
      cloneTarget[key] = target[key]
    }
  }
  return cloneTarget
}
