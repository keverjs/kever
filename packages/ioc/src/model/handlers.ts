const getHandler = (
  target: object,
  key: string,
  value: unknown,
  receiver: object
) => Reflect.get(target, key, receiver)

const setHandler = (
  target: object,
  key: string,
  value: unknown,
  receiver: object
) => Reflect.set(target, key, value, receiver)

const toJSONHandler = (
  target: object,
  key: string,
  value: unknown,
  receiver: object
) => JSON.stringify(target)

const unproxyHandler = (
  target: object,
  key: string,
  value: unknown,
  receiver: object
) => target

const initHandler = (
  target: object,
  key: string,
  value: unknown,
  receiver: object
) => {
  let object = value as Record<string, unknown>
  if (typeof value === 'string') {
    object = JSON.parse(value)
  }
  Object.keys(object).forEach((key) => {
    Reflect.set(target, key, object[key], receiver)
  })
}

export const PREFIX_HANDLERS = {
  get: getHandler,
  set: setHandler,
  toJSON: toJSONHandler,
  unproxy: unproxyHandler,
  init: initHandler,
}
