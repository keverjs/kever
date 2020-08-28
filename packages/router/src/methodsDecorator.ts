type Methods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'
export interface RouterMetadataType {
  methods: Methods[]
  path: string
}
type HttpDecoratorType = (path: string) => MethodDecorator

export const META_ROUTER = Symbol.for('router#meta_router')

// create http request method decorator
/**
 * @description get router
 */
export const Get = createHTTPMethodDecorator(['get'])
/**
 * @description post router
 */
export const Post = createHTTPMethodDecorator(['post'])
/**
 * @description put router
 */
export const Put = createHTTPMethodDecorator(['put'])
/**
 *  @description delete router
 */
export const Delete = createHTTPMethodDecorator(['delete'])
/**
 *  @description delete router
 */
export const Head = createHTTPMethodDecorator(['head'])
/**
 *  @description delete router
 */
export const Options = createHTTPMethodDecorator(['options'])
/**
 *  @description delete router
 */
export const Patch = createHTTPMethodDecorator(['patch'])
/**
 * @description all router
 */
export const All = createHTTPMethodDecorator([
  'get',
  'post',
  'put',
  'delete',
  'head',
  'options',
  'patch',
])

/**
 * @description 路由装饰器生成器
 * @param methods
 */
function createHTTPMethodDecorator(methods: Methods[]): HttpDecoratorType {
  return (path): MethodDecorator => (target, propertyKey, descripator) => {
    const routerMetadata: RouterMetadataType = {
      methods,
      path,
    }
    Reflect.defineMetadata(
      META_ROUTER,
      routerMetadata,
      descripator.value as Object
    )
  }
}
