import { Model } from '../models'
export interface CourseInterface {
  getCourse: (id: number) => Model.CourseModel
}

export interface UserInterface {
  getUser: (id: number) => Model.UserModel
}
