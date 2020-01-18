import { BaseController, Controller, Get, Inject, Params } from 'kever'
import { USER } from '../constants'

@Controller()
export default class UserController extends BaseController {
  @Inject(USER)
  private user

  @Get('/getUser')
  public async getUser(@Params(['query']) query) {
    const data = await this.user.getUser(Number(query.id))
    let result
    if (data) {
      result = {
        code: 200,
        message: 'success',
        data
      }
    } else {
      result = {
        code: 0,
        message: `id为${query.id}的用户未找到`,
        data: null
      }
    }
    this.ctx.body = result
  }
}
