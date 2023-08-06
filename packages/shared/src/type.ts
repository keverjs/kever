export const isBoolean = (value: unknown): value is boolean =>
  typeof value === 'boolean'

export const isDef = (value: unknown): value is undefined =>
  typeof value !== 'undefined'


export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
