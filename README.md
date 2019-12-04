# sunnier

A lightweight inversion of control container for Node.js apps powered by TypeScript and Koa runtime.

**Support:**

- Typescript ✅
- IOC ✅
- HTTP Server ✅
- HTTP Decorator Router ✅
- AOP Route Plugins✅
- Global Plugins ✅
- Params Decorator 🤩
- Shield app.ts, add config mode 🤩
- more Decorator 🤩

# Quick Start

## Install

> npm install sunnier reflect-metadata typescript --save

**1、define constants**

```ts
//constants/index.ts
export const TEST_CONTROLLER = Symbol.for(TEST_CONTROLLER)
```

**2、create a injectable model**

```ts
//models/Test.ts
import { Injectable } from 'sunnier'
import { TEST_CONTROLLER } from './constants'

@Injectable(TEST_CONTROLLER)
export class Test {
  private data: Array<string> = ['zhuangsan', 'lisi', 'wanger', 'mazi']
  getTest(id: number): string {
    return this.data[id]
  }
}
```

**3、create a controller inject Test model**

```ts
//controllers/TestController.ts
import {
  Controller,
  Inject,
  Get,
  Post,
  Put,
  All,
  Delete,
  BaseController
} from 'sunnier'
import { TEST_CONTROLLER } from './constants'

export class TestController extends BaseController {
  @Inject(TEST_CONTROLLER)
  private _test
  constructor() {}
  @Get('/getTest')
  async getTest() {
    const result = this._test.getTest(1)
    this.ctx.body = {
      code: 200,
      noerr: '',
      data: {
        result
      }
    }
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

**4、loader controller and model**

```ts
// loader.ts
import './models/Test'
import './constrollers/TestController'
```

**5、create a application**

```ts
// app.ts
import { createApplication } from 'sunnier'
import './loader'

const app = createApplication()

app.listen(8080, () => {
  console.log('server is running....')
})
```

**6、golbal middleware**

```ts
import { createApplication } from 'sunnier'
import './loader'

async function test(ctx, next) {
  console.log('123')
  await next()
}

const app = createApplication({
  plugins: [test]
})

app.listen(8080, () => {
  console.log('server is running....')
})
```

**7、AOP Route**

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

export class TestController extends BaseController {
  @Inject(TEST_CONTROLLER)
  private _test
  constructor() {}
  @Get('/getTest', {
    before: [before],
    after: [after]
  })
  async getTest() {
    const result = this._test.getTest(1)
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
