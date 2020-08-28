import { Tag, InstancePool, InstanceType } from '../instancePool'

export const pluginPatchPool = new InstancePool<Tag, any>()
export const pluginPatch = (tag: Tag, payload: any | Function) => {
  let options
  if (typeof payload === 'function') {
    options = payload()
  } else {
    options = payload
  }
  pluginPatchPool.bind(tag, options)
}
