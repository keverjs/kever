import { Context } from 'koa'
import { META_PARAMS } from '../../constants'
import { ParamsMetaInterface } from '../../interface'
export const Params = (tags: Array<string> = []) => (
  target: any,
  propertyKey: string,
  paramIndex: number
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

export const getParamsHeandler = (
  ctx: Context,
  paramMeta: ParamsMetaInterface
): Array<any> => {
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
