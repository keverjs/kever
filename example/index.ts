import { createApplication } from '../src/index'
import './loader'

createApplication({
  plugins: []
}).listen(8000, () => {
  console.log('server is running')
})
