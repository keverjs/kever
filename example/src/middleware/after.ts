import {
  Controller,
  registerMiddle,
  registerGlobalMiddle,
  BaseMiddle
} from 'kever'

@registerMiddle('afterMiddleware')
export default class TestMiddleware implements BaseMiddle {
  async ready(ctx, next) {
    console.log('这里是after中间件')
    await next()
  }
}
