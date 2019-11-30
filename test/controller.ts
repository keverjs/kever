import {
  Inject,
  Get,
  Post,
  Put,
  Delete,
  Controller
} from '../src/index'
import {UserInstance} from './constants'

@Inject(UserInstance)
@Controller()
export class UserController {
  private _user;
  constructor(user) {
    this._user = user;
  }
  @Get('/')
  async getUser(ctx: any, next: Promise<any>): Promise<any> {
    console.log(this)
    const result = this._user.getUser(1);
    ctx.body = {
      code: 200,
      data: result
    };
  }
}