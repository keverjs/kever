import { logger } from '@kever/logger'
import { InstancePool, Tag, InstanceType } from './instancePool'

type InjectableDecoratorType = (tag: Tag) => ClassDecorator
type InjectDecoratorType = (
  tag: Tag,
  payload?: { params?: any }
) => PropertyDecorator

const instancePool = new InstancePool<Tag, InstanceType>()

/**
 * @description 标记当前类是可注入的
 * @param tag
 */
export const Injectable: InjectableDecoratorType = (tag) => (target) => {
  const ret = instancePool.bind(tag, (target as unknown) as InstanceType)
  if (!ret) {
    logger.error(` ${tag.toString} model existence`)
    return
  }
  logger.info(`${target.name} is already registered for injection`)
}

/**
 * @description 注入类
 * @param tag
 */
export const Inject: InjectDecoratorType = (tag, { params } = {}) => (
  target,
  propertyKey
) => {
  // check instance is Controller
  const _isExtends = (target as any)._isExtends
  if (!_isExtends) {
    logger.error(`${target.constructor.name} module is not a controller`)
    return
  }

  const injectable = instancePool.use(tag)
  if (typeof injectable === 'boolean') {
    instancePool.on(tag, (injectable) => {
      instancePoolEventHandler(target, propertyKey, injectable, params)
      logger.info(
        `Inject ${injectable.name} into the ${propertyKey.toString} property of ${target.constructor.name}`
      )
    })
  } else {
    instancePoolEventHandler(target, propertyKey, injectable, params)
    logger.info(
      `Inject ${injectable.name} into the ${propertyKey.toString} property of ${target.constructor.name}`
    )
  }
}

function instancePoolEventHandler(
  target: Object,
  propertyKey: Tag,
  injectable: InstanceType,
  params: any
) {
  let parameter: any[]
  if (Array.isArray(params)) {
    parameter = params
  } else {
    parameter = [params]
  }
  const instanceModel = new injectable(...parameter)
  Object.defineProperty(target, propertyKey, {
    value: instanceModel,
    writable: false,
    configurable: false,
    enumerable: true,
  })
}
