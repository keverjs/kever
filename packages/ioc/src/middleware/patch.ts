import { Tag, Container } from '@kever/shared'

type Payload = (() => unknown) | string | number | symbol | unknown[] | object
type PayloadExcludeFn = Exclude<Payload, () => unknown>

export const mdPatchContainer = new Container<Tag, PayloadExcludeFn>()

export const middlewarePatch = (tag: Tag, payload: Payload) => {
  let option: PayloadExcludeFn
  if (typeof payload === 'function') {
    option = payload()
  } else {
    option = payload
  }
  mdPatchContainer.bind(tag, option)
}
