import { InstancePool, InstanceType, Tag } from '../instancePool'

export const modelPool = new InstancePool<Tag, unknown>()

export const Model = (tag: Tag): ClassDecorator => {
  return (target) => {
    const constructor = (target as unknown) as InstanceType
    const modelInstance = new constructor()
    modelPool.bind(tag, modelInstance)
  }
}
