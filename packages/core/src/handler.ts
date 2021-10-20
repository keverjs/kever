import * as Koa from 'koa'
import { destoryAllPlugin } from '@kever/ioc'
import { logger } from '@kever/logger'

export const initEvent = (app: Koa) => {
  app.on('error', (err) => {
    logger.error(`${err.message} \n ${err.stack}`)
  })

  app.on('close', destoryAllPlugin)
  app.on('exit', destoryAllPlugin)
}
