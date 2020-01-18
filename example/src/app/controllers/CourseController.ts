import { BaseController, Controller, Inject, Get, Params } from 'kever'
import { COURSE } from '../constants'

@Controller()
export default class CourseController extends BaseController {
  @Inject(COURSE)
  private _course

  @Get('/getCourse')
  public async getCourse(@Params(['query']) query) {
    const data = await this._course.getCourse(Number(query.id))
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
        message: `未找到id为${query.id}的课程`,
        data: null
      }
    }
    this.ctx.body = result
  }
}
