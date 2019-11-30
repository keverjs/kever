import './loader'
import {createApplication} from '../src/index'

const app = createApplication()


app.listen(8080, () => {
  console.log("server is running ")
})
