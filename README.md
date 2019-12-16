# sunnier

⚙A lightweight inversion of control container for Node.js apps powered by TypeScript and Koa runtime.

**Support:**

- Typescript ✅
- IOC ✅
- HTTP Server ✅
- HTTP Decorator Router ✅
- AOP Route Plugins✅
- Global Plugins ✅
- Params Decorator ✅
- Shield app.ts, add config mode ✅
- more Decorator 🤩

# Quick Start

## Install

> npm install sunnier sunnier-cli typescript --save

#### step1

define constants

```ts
//constants/index.ts
export const USER = Symbol.for('USER')
```

#### step2

create a model

```ts
//models/User.ts
export namespace Model {
  export class UserModel {
    id: Number
    name: String
    age: Number
    sex: Number //0 男 1 女
  }
}
```

### step3

create a injectable service

```ts
//service/User.ts
import { Injectable } from 'sunnier'
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
```

#### step4

create a controller and inject User service

```ts
//controllers/UserController.ts
import { BaseController, Controller, Get, Inject, Params } from 'sunnier'
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
  @Post('/postTest')
  async postTest() {
    this.ctx.body = {
      method: 'post'
    }
  }
  @Put('/putTest')
  async putTest() {
    this.ctx.body = {
      method: 'put'
    }
  }
  @Delete('deleteTest')
  async deleteTest() {
    this.ctx.body = {
      method: 'delete'
    }
  }
  @All('allTest')
  async allTest() {
    this.ctx.body = {
      method: 'all'
    }
  }
}
```

#### step5

write sunnier.config.js file

```ts
module.exports = {
  plugins: [],
  port: 9000,
  loadPath: {
    controller: './dist/controllers',
    service: './dist/service'
  }
}
```

#### step6

startup server

> sunnier-cli

open 127.0.0.1:9000/getUser?id=1 in browser

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "李四",
    "age": 19,
    "sex": 1
  }
}
```

#### step7

golbal middleware

```ts
async function text(ctx, next) {
  console.log('middleware')
  next()
}
module.exports = {
  plugins: [text],
  port: 9000,
  loadPath: {
    controller: './dist/controllers',
    service: './dist/service'
  }
}
```

#### step8

aop based on route,

```ts
import { Controller, Inject, Get, BaseController } from 'sunnier'
import { TEST_CONTROLLER } from './constants'

async function before(ctx, next) {
  console.log('before')
  await next()
}
async function after(ctx, next) {
  console.log('after')
  await next()
}

export class UserController extends BaseController {
  @Inject(USER)
  private user
  constructor() {}
  @Get('/getUser', {
    before: [before],
    after: [after]
  })
  async getUser() {
    const result = this.user.getUser(1)
    this.ctx.body = {
      code: 200,
      noerr: '',
      data: {
        result
      }
    }
    await this.next()
  }
}
```

### Params Decorator

#### @Headers

get request headers

```ts
async getUest(@Headers(['host']) host) {
  console.log(host) //127.0.0.1
  const result = this.user.getUser(1)
  this.ctx.body = {
    code: 200,
    noerr: '',
    data: {
      result
    }
  }
  await this.next()
}
```

#### @Req

get http request

```ts
async getUser(@Req() req) {
  console.log(req)
}
```

#### @Res

get http response

```ts
async getUser(@Res() res) {
  console.log(res)
}

```

#### @Cookie

get cookie

```ts
async getUser(@Cookie() cookie) {
  console.log(cookie)
}
```

#### @Params

get http request parameters, include：body、params、query.

```ts
async getUser(@Params() args) {
  console.log(args.body)
  console.log(args.params)
  console.log(args.query)
}
```
