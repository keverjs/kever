import { registerMiddle, registerGlobalMiddle, BaseMiddle } from 'kever'

@registerMiddle('beforeMiddleware')
export default class TestMiddleware implements BaseMiddle {
  async ready(ctx, next) {
    console.log('这里是before中间件')
    await next()
  }
}
