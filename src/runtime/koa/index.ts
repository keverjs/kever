import * as Koa from 'koa'

function KoaRuntime(controllers: Set<any>) {
  const app = new Koa()
  console.log(controllers)
  return app
}

export default KoaRuntime