import { META_REQ, META_RES, META_COOKIE } from '../../constants'
import { Headers, getHeadersHandler } from './headers'
import { Params, getParamsHeandler } from './params'
/**
 * get request
 */
const Req = createParamDecorator(META_REQ)

/**
 * get response
 */
const Res = createParamDecorator(META_RES)
/**
 * get cookie
 */
const Cookie = createParamDecorator(META_COOKIE)

/**
 * @description 基础参数装饰器生成器
 * @param key
 */
function createParamDecorator(key: symbol) {
  return (): ParameterDecorator => (target, propertyKey, paramIndex) => {
    Reflect.defineMetadata(key, paramIndex, target[propertyKey])
  }
}

export {
  Req,
  Res,
  Cookie,
  Headers,
  Params,
  getHeadersHandler,
  getParamsHeandler
}
