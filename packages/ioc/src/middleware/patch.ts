import { Tag, Container } from '@kever/shared'

type Payload = (() => unknown) | string | number | symbol | any[] | object
type PayloadExcludeFn = Exclude<Payload, () => unknown>

export const middlewarePatchContainer = new Container<Tag, PayloadExcludeFn>()

export const middlewarePatch = (tag: Tag, payload: Payload) => {
  let option: PayloadExcludeFn
  if (typeof payload === 'function') {
    option = payload()
  } else {
    option = payload
  }
  middlewarePatchContainer.bind(tag, option)
}
