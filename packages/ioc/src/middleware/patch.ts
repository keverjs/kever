import { Tag, Container } from '@kever/shared'

type Payload = (() => unknown) | string | number | symbol | unknown[] | Record<string, unknown>
type PayloadExcludeFn = Exclude<Payload, () => unknown>

export const mdPatchContainer = new Container<Tag, PayloadExcludeFn>()

export const patchMiddleware = (tag: Tag, payload: Payload) => {
  let option: PayloadExcludeFn
  if (typeof payload === 'function') {
    option = payload() as PayloadExcludeFn
  } else {
    option = payload
  }
  mdPatchContainer.bind(tag, option)
}
