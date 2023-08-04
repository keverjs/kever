import { destoryAllMiddleware } from '@kever/ioc'
import { Server } from 'node:http'
import process from 'process'
import type { App } from './application'

const signalEventHandler = (app: App, http: Server) => (type: string, index: number) => {
  app.options.logger.debug(`app will close. [signal: '${type}', number: ${index}]`)
  http.close()
}

const appEventHandler = () => () => {
  // destory all plugin
  destoryAllMiddleware()
}

const initSignalEvent = (app: App, http: Server) => {
  process.on('SIGINT', signalEventHandler(app, http))
  process.on('SIGTERM', signalEventHandler(app, http))
}

export const initEvent = (app: App, http: Server) => {
  http.on('error', (err) => {
    app.options.logger.error(`${err.message} \n ${err.stack}`)
  })
  http.on('close', appEventHandler())
  http.on('exit', appEventHandler())
  initSignalEvent(app, http)
}
