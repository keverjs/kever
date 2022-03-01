import { logger } from '@kever/logger'
import { InstancePool, Tag, InstanceType } from './instancePool'
import { propertyPool, construct } from './construct'

const instancePool = new InstancePool<Tag, InstanceType>()

/**
 * @description 标记当前类是可注入的
 * @param tag
 */
export const Injectable =
  (tag: Tag): ClassDecorator =>
  (target) => {
    const ret = instancePool.bind(tag, target as unknown as InstanceType)
    if (!ret) {
      logger.error(` ${tag.toString()} model existence`)
      return
    }
    return target
  }

/**
 * @description 注入类
 * @param tag
 */
export const Inject =
  <T>(tag: Tag, unNew = false, param?: T): PropertyDecorator =>
  (target, propertyKey) => {
    const instance = instancePool.use(tag)
    if (typeof instance === 'boolean') {
      instancePool.on(tag, (injectable) => {
        instancePoolEventHandler(target, propertyKey, injectable, unNew, param)
      })
    } else {
      instancePoolEventHandler(target, propertyKey, instance, unNew, param)
    }
  }

function instancePoolEventHandler(
  target: Object,
  propertyKey: Tag,
  injectable: InstanceType,
  unNew: boolean,
  params: unknown
) {
  let parameter: unknown[]
  if (Array.isArray(params)) {
    parameter = params
  } else {
    parameter = [params]
  }
  const instance = unNew ? injectable : construct(injectable, parameter)

  const poolKey = target.constructor.name
  let pool = propertyPool.use(poolKey)

  if (typeof pool === 'boolean') {
    pool = new Map<string, unknown>()
  }
  pool.set(propertyKey, instance)
  propertyPool.bind(poolKey, pool)
}
