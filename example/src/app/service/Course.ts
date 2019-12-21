import { Injectable } from 'sunnier'
import { COURSE } from '../constants/index'
import { Model } from '../models'
import { CourseInterface } from '../interface'

@Injectable(COURSE)
export default class Course implements CourseInterface {
  private courses: Array<Model.CourseModel>
  constructor() {
    this.courses = [
      {
        id: 0,
        name: '数据结构',
        score: 4.0,
        teacherName: '王老师',
        bookName: '数据结构设计'
      },
      {
        id: 1,
        name: 'C语言',
        score: 5.0,
        teacherName: '冲老师',
        bookName: 'C语言设计'
      },
      {
        id: 2,
        name: 'JavaScript基础',
        score: 6.0,
        teacherName: '周老师',
        bookName: 'JavaScript语言精粹'
      },
      {
        id: 3,
        name: 'CSS教程',
        score: 8.0,
        teacherName: '敏老师',
        bookName: 'CSS世界'
      }
    ]
  }
  public getCourse(id: number): Model.CourseModel {
    return this.courses.find(sourse => sourse.id === id)
  }
}
