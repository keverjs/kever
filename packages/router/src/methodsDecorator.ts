import { setMetadata, META_ROUTER } from '@kever/shared'
type Methods = 'get' | 'post' | 'put' | 'delete' | 'head' | 'options' | 'patch'
export interface RouterMetadata {
  methods: Methods[]
  path: string
}



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
 * @description router decroator generator
 * @param methods
 */
function createHTTPMethodDecorator(methods: Methods[]) {
  return (path: string): MethodDecorator =>
    (_target, _propertyKey, descripator) => {
      const routerMetadata: RouterMetadata = {
        methods,
        path,
      }
      setMetadata(META_ROUTER, routerMetadata, descripator.value)
    }
}
