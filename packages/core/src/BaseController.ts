import Koa from 'koa'

/**
 * @description controller的基础可继承类，继承自Koa。
 */
export class BaseController extends Koa {
  /**
   * @description 使用继承的方式显示的让每一个controller可以从实例上获取到ctx和next
   */
  public ctx: Koa.Context
  public next: Koa.Next
  /**
   * @description controller继承baseController的标识
   */
  public _isExtends: symbol = Symbol.for('BaseController#isExtends')
}
BaseController.prototype._isExtends = Symbol.for('BaseController#isExtends')
