import { Tag, InstancePool } from '../instancePool'

type Payload = (() => unknown) | string | number | symbol | any[] | object
type PayloadExcludeFn = Exclude<Payload, () => unknown>

export const pluginPatchPool = new InstancePool<Tag, PayloadExcludeFn>()

export const pluginPatch = (tag: Tag, payload: Payload) => {
  let option: PayloadExcludeFn
  if (typeof payload === 'function') {
    option = payload()
  } else {
    option = payload
  }
  pluginPatchPool.bind(tag, option)
}
