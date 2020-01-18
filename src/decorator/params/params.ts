import { Context } from 'koa'
import { META_PARAMS } from '../../constants'
import { ParamsMetaInterface } from '../../types'

/**
 * @description 请求参数装饰器
 * @param tags
 */
type ParamsType = (tags: Array<string>) => ParameterDecorator
export const Params: ParamsType = (tags = []) => (
  target,
  propertyKey,
  paramIndex
) => {
  Reflect.defineMetadata(
    META_PARAMS,
    {
      index: paramIndex,
      tags
    },
    target[propertyKey]
  )
}

/**
 * @description 请求参数装饰器服务函数
 * @param ctx
 * @param paramMeta
 */
type ParamsHeandlerType = (
  ctx: Context,
  paramMeta: ParamsMetaInterface
) => Array<any>
export const getParamsHeandler: ParamsHeandlerType = (ctx, paramMeta) => {
  const { index, tags } = paramMeta
  const allParams = {
    body: ctx.request.body,
    query: ctx.request.query,
    params: ctx.params
  }
  let result
  if (tags.length === 0) {
    result = allParams
  } else if (tags.length === 1) {
    result = allParams[tags[0]]
  } else {
    result = tags.reduce((pre, item) => {
      pre[item] = allParams[item]
      return pre
    }, {})
  }

  return [index, result]
}
