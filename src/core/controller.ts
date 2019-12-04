import * as Koa from 'koa'

/**
 *
 */
export default class BaseController extends Koa {
  /**
   *
   */
  public ctx: Koa.Context
  /**
   *
   */
  public next: Koa.Next
  /**
   *
   */
  public _isExtends: symbol = Symbol.for('BaseController#isExtends')
}
