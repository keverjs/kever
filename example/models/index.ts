import { Injectable } from '../../src/index'
import { UserInstance } from '../constants'

@Injectable(UserInstance)
export class User {
  private data: Array<string> = ['wang', 'chong', 'zhou', 'hui', 'min']
  getUser(id: number): string {
    return this.data[id]
  }
}
