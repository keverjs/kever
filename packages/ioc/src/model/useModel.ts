import { Tag } from '../instancePool'
import { modelPool } from './registerModel'

export const UseModel = (tag: Tag): PropertyDecorator => (
  target,
  propertyKey
) => {
  const model = modelPool.use(tag)
  if (typeof model === 'boolean') {
    modelPool.on(tag, (model) => {
      modelPoolEventHandler(target, propertyKey, model)
    })
  } else {
    modelPoolEventHandler(target, propertyKey, model)
  }
}

const modelPoolEventHandler = (
  target: Object,
  propertyKey: Tag,
  value: unknown
) => {
  Object.defineProperty(target, propertyKey, {
    value,
    writable: false,
    configurable: false,
    enumerable: true,
  })
}
