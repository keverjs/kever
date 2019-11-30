import './loader'
import {createApplication} from '../src/index'

async function test(ctx, next: Function): Promise<any> {
  console.log('golbal')
  await next()
  return;
}


const app = createApplication({
  plugins: [test]
})


app.listen(8080, () => {
  console.log("server is running ")
})
