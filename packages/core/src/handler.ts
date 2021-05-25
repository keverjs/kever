import * as Koa from 'koa'
import { getAllPlugin } from '@kever/ioc'
import { logger } from '@kever/logger'

export const initEvent = (app: Koa) => {
  app.on('error', (error) => {
    logger.error(error)
  })

  app.on('close', () => {
    const instances = getAllPlugin()
    for (const instance of instances.values()) {
      instance.destory && instance.destory()
    }
  })
}
