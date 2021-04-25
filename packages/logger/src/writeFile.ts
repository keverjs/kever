import { _checkFolderExistence, _processDate } from './utils'
import { Worker, isMainThread } from 'worker_threads'
import { resolve } from 'path'

export interface LogInfoType {
  type: string
  content: string
  logDir: string
  isDependentOutput: boolean
}
let worker: Worker | null = null

if (isMainThread) {
  worker = new Worker(resolve(__dirname, './thread.js'))
}
process.on('exit', () => {
  if (worker) {
    worker.postMessage({
      type: 'close',
    })
  }
})

const logInfoMap = new Map<string, Set<LogInfoType>>()

const writeFileAction = async (logDir: string) => {
  await _checkFolderExistence(logDir)
  const allLogInfo = logInfoMap.get('all')
  if (allLogInfo) {
    if (worker) {
      worker.postMessage({
        type: 'message',
        data: {
          type: '',
          logInfoSet: allLogInfo,
        },
      })
    }
  } else {
    for (let key of logInfoMap.keys()) {
      const singleLogInfo = logInfoMap.get(key)
      logInfoMap.clear()
      if (singleLogInfo) {
        if (worker) {
          worker.postMessage({
            type: 'message',
            data: {
              type: `/${key}`,
              logInfoSet: singleLogInfo,
            },
          })
        }
      }
    }
  }
}

/**
 * @description 将日志输出到日志文件中
 * @param content
 * @param logDir
 */

export const logHandler = (() => {
  let timer: NodeJS.Timeout
  return (
    content: string,
    logDir: string,
    type: string,
    isDependentOutput: boolean
  ) => {
    clearTimeout(timer)
    const mapKey = isDependentOutput ? type : 'all'
    let logInfoSet: Set<LogInfoType>
    const logInfo = logInfoMap.get(mapKey)
    if (logInfo) {
      logInfoSet = logInfo
    } else {
      logInfoSet = new Set<LogInfoType>()
      logInfoMap.set(mapKey, logInfoSet)
    }
    logInfoSet.add({
      type,
      content,
      logDir,
      isDependentOutput,
    })
    timer = setTimeout(() => {
      writeFileAction(logDir)
    }, 500)
  }
})()
