type Methods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'
export interface RouterMetadata {
  methods: Methods[]
  path: string
}

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
function createHTTPMethodDecorator(methods: Methods[]) {
  return (path: string): MethodDecorator =>
    (target, propertyKey, descripator) => {
      const routerMetadata: RouterMetadata = {
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
