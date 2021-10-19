import * as Koa from 'koa'
import { destoryAllPlugin } from '@kever/ioc'
import { logger } from '@kever/logger'

export const initEvent = (app: Koa) => {
  app.on('error', (error) => {
    logger.error(error)
  })

  app.on('close', destoryAllPlugin)
  app.on('exit', destoryAllPlugin)
}
