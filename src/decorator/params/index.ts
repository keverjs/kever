import { META_REQ, META_RES, META_COOKIE } from '../../constants'
import { Headers, getHeadersHandler } from './headers'
import { Params, getParamsHeandler } from './params'
const Req = createParamDecorator(META_REQ)

const Res = createParamDecorator(META_RES)

const Cookie = createParamDecorator(META_COOKIE)

/**
 *
 * @param key
 *
 */
function createParamDecorator(key: symbol) {
  return () => (target: any, propertyKey: string, paramIndex: number) => {
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
