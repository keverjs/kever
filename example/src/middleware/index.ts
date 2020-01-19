import {
  registerMiddle,
  registerGolbalMiddle,
  BaseMiddle
} from '../../../lib/index'

@registerGolbalMiddle('testMiddleware')
export default class TestMiddleware implements BaseMiddle {
  async ready(ctx, next) {
    console.log('这里是全局中间件')
  }
}
