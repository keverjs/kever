export const isBoolean = (value: any): value is boolean =>
  typeof value === 'boolean'

export const isDef = (value: any): value is undefined =>
  typeof value !== 'undefined'
