import {
  Controller,
  registerMiddle,
  registerGlobalMiddle,
  BaseMiddle
} from 'kever'

@registerGlobalMiddle('testMiddleware')
export default class TestMiddleware implements BaseMiddle {
  async ready(ctx, next) {
    console.log('这里是全局中间件')
    await next()
  }
}
