export const isBoolean = (value: any): value is boolean =>
  typeof value === 'boolean'

export const isDef = (value: any): value is undefined =>
  typeof value !== 'undefined'


export const isPromise = <T>(object: T) =>
  Object.prototype.toString.call(object).slice(8, -1) === 'Promise'
