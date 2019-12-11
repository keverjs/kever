import {
  META_HEADERS,
  META_REQ,
  META_RES,
  META_COOKIE,
  META_PARAMS
} from '../../constants'
import { getHeadersHandler, getParamsHeandler } from '../../decorator/params'
import { Context } from 'koa'
const paramMap = {
  [META_HEADERS]: getHeadersHandler,
  [META_REQ]: (ctx: Context, index: number) => [index, ctx.req],
  [META_RES]: (ctx: Context, index: number) => [index, ctx.res],
  [META_COOKIE]: (ctx: Context, index: number) => [index, ctx.cookie],
  [META_PARAMS]: getParamsHeandler
}
export default (routeFunction: Function, ctx: Context) => {
  let routeParams = []
  Object.getOwnPropertySymbols(paramMap).forEach(paramKey => {
    const paramMeta = Reflect.getMetadata(paramKey, routeFunction)
    if (paramMeta) {
      const [paramIndex, paramResult] = paramMap[paramKey](ctx, paramMeta)
      routeParams[paramIndex] = paramResult
    }
  })
  return routeParams
}
