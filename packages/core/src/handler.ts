import { destoryAllPlugin } from '@kever/ioc'
import { logger } from '@kever/logger'
import { Server } from 'http'
import process from 'process'

const signalEventHandler = (app: Server) => (type: string, index: number) => {
  logger.debug(`app will close. [signal: '${type}', number: ${index}]`)
  app.close()
}

const appEventHandler = () => () => {
  // destory all plugin
  destoryAllPlugin()
}

const initSignalEvent = (app: Server) => {
  process.on('SIGINT', signalEventHandler(app))
  process.on('SIGTERM', signalEventHandler(app))
}

export const initEvent = (app: Server) => {
  app.on('error', (err) => {
    logger.error(`${err.message} \n ${err.stack}`)
  })
  app.on('close', appEventHandler())
  app.on('exit', appEventHandler())
  initSignalEvent(app)
}
