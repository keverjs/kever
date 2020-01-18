import { Injectable } from 'kever'
import { USER } from '../constants'
import { Model } from '../models'
import { UserInterface } from '../interface'
@Injectable(USER)
export default class User implements UserInterface {
  private users: Array<Model.UserModel>
  constructor() {
    this.users = [
      {
        id: 0,
        name: '张三',
        age: 18,
        sex: 0
      },
      {
        id: 1,
        name: '李四',
        age: 19,
        sex: 1
      },
      {
        id: 2,
        name: '王二',
        age: 20,
        sex: 1
      },
      {
        id: 3,
        name: '麻子',
        age: 21,
        sex: 0
      }
    ]
  }
  getUser(id: number): Model.UserModel {
    return this.users.find(user => user.id === id)
  }
}
