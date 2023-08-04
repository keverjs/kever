/**
 * meta key
 */

// controller
export const META_CONTROLLER = Symbol.for('meta#controller')

// router
export const META_ROUTER = Symbol.for('meta#router')

// middleware
export const META_MIDDLEWARE_GLOBAL = Symbol.for('meta#middleware_global')
export const META_MIDDLEWARE_ALL = Symbol.for('meta#middleware_all')
export const META_MIDDLEWARE_ROUTER = Symbol.for('meta#middleware_router')

// inject property
export const META_INJECT_PROPERTY = Symbol.for('meta#inject_property')

// logger
export const META_LOGGER = Symbol.for('meta#logger')

// metadata store
const META_STORE_TARGET = Object.create(null)
const STORE_KEY_CACHE: Set<symbol | string> = new Set()

/**
 * meta methods
 */

/**
 * Reflect.getOwnMetadata
 * @param metadataKey 
 * @param target 
 * @param propertyKey 
 * @returns 
 */
export const getMetadata = <T>(metadataKey: string | symbol, target: any, propertyKey?: string | symbol): T => {
  if (propertyKey) {
    return Reflect.getOwnMetadata(metadataKey, target, propertyKey)
  }
  return Reflect.getOwnMetadata(metadataKey, target)
}

/**
 * Reflect.defineMetadata 
 * @param metadataKey 
 * @param value 
 * @param target 
 * @param propertyKey 
 * @returns 
 */
export const setMetadata = (metadataKey: string | symbol, value: any, target: any, propertyKey?: string | symbol) => {
  if (propertyKey) {
    return Reflect.defineMetadata(metadataKey, value, target, propertyKey)
  }
  return Reflect.defineMetadata(metadataKey, value, target)
}

/**
 * Reflect.deleteMetadata
 * @param metadataKey 
 * @param target 
 * @param propertyKey 
 * @returns 
 */
export const deleteMetadata = (metadataKey: string | symbol, target: any, propertyKey?: string | symbol) => {
  if (propertyKey) {
    return Reflect.deleteMetadata(metadataKey, target, propertyKey)
  }
  return Reflect.deleteMetadata(metadataKey, target)
}

/**
 * get metadata store value by key
 * @param metadataKey 
 * @returns 
 */
export const getMetadataStore = <T>(metadataKey: string | symbol): T => {
  return getMetadata<T>(metadataKey, META_STORE_TARGET)
}

/**
 * set metadata store value
 * @param metadataKey 
 * @param value 
 * @returns 
 */
export const setMetadataStore = (metadataKey: string | symbol, value: any) => {
  if (STORE_KEY_CACHE.has(metadataKey)) {
    return false
  }
  setMetadata(metadataKey, META_STORE_TARGET, value)
  STORE_KEY_CACHE.add(metadataKey)
  return true
}

/**
 * remove metadata store value by key
 * @param metadataKey 
 * @returns 
 */
export const removeMetadataStore = (metadataKey: string | symbol) => {
  const deleted = deleteMetadata(metadataKey, META_STORE_TARGET)
  if (deleted) {
    STORE_KEY_CACHE.delete(metadataKey)
  }
  return deleted
}
