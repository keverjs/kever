import {
  Inject,
  Get,
  Post,
  Put,
  Delete,
  All,
  Controller,
  BaseController,
  Headers,
  Req,
  Res,
  Cookie,
  Params
} from '../../src/index'
import { UserInstance } from '../constants'

@Controller()
export class UserController extends BaseController {
  @Inject(UserInstance)
  private _user
  @All('/getUser')
  async getUser(
    @Headers(['host']) headers,
    @Res() res,
    @Req() req,
    @Cookie() cookie,
    @Params() params
  ): Promise<any> {
    // console.log('headers', headers)
    // console.log('res', res)
    // console.log('req', this.ctx.request.query, this.ctx.params)
    // console.log('params', params)
    console.log('cookie', cookie)
    const result = this._user.getUser(1)
    this.ctx.body = {
      code: 200,
      data: result
    }
    await this.next()
  }
}

@Controller()
export class TestController extends BaseController {
  private _user
  @Get('/getTestUser')
  async getUser(ctx: any, next: Function): Promise<any> {
    // const result = this._user.getUser(2);
    ctx.body = {
      code: 200
      // data: result
    }
  }
}

async function before1(ctx, next) {
  console.log(1)
  await next()
}
async function before2(ctx, next) {
  console.log(2)
  await next()
}
async function before3(ctx, next) {
  console.log(3)
  await next()
}
async function after1(ctx, next) {
  console.log(4)
  await next()
}
async function after2(ctx, next) {
  console.log(5)
  await next()
}

async function after3(ctx, next) {
  console.log(6)
  await next()
}
