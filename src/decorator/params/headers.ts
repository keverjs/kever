import { META_HEADERS } from '../../constants'
import { ParamsMetaInterface } from '../../types'
import { Context } from 'koa'
/**
 * @description 路由函数参数装饰器，可直接获取到请求的header
 * @param headers
 */
type HeadersType = (tags: Array<string>) => ParameterDecorator
export const Headers: HeadersType = (tags = []) => (
  target,
  propertyKey,
  paramIndex
) => {
  Reflect.defineMetadata(
    META_HEADERS,
    {
      index: paramIndex,
      tags
    },
    target[propertyKey]
  )
}

/**
 * @description 获取header的辅助函数
 * @param ctx
 * @param paramMeta
 */
type HeadersHandlerType = (
  ctx: Context,
  paramMeta: ParamsMetaInterface
) => Array<any>

export const getHeadersHandler: HeadersHandlerType = (ctx, paramMeta) => {
  const { index, tags } = paramMeta
  const rawHeaders = ctx.req.headers
  let result
  if (tags.length === 0) {
    result = rawHeaders
  } else if (tags.length === 1) {
    result = rawHeaders[tags[0]]
  } else {
    result = tags.reduce((pre, item) => {
      pre[item] = rawHeaders[item]
      return pre
    }, {})
  }
  return [index, result]
}
