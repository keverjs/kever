import { META_HEADERS } from '../../constants'
import { ParamsMetaInterface } from '../../interface'
import { Context } from 'koa'
/**
 *
 * @param headers
 */
export const Headers = (tags: Array<string> = []) => (
  target: any,
  propertyKey: string,
  paramIndex: number
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
 *
 * @param ctx
 * @param paramMeta
 */
export const getHeadersHandler = (
  ctx: Context,
  paramMeta: ParamsMetaInterface
): Array<any> => {
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
