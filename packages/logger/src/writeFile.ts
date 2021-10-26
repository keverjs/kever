import {
  checkFileExistence,
  checkFolderExistence,
  processDate,
  witerFileHandler,
} from './utils'

interface LogInfoType {
  type: string
  content: string
  logDir: string
  isDependentOutput: boolean
}
const logInfoMap = new Map<string, Set<LogInfoType>>()

const writeFileHandler = async (type: string, logInfoSet: Set<LogInfoType>) => {
  let logDir: string | undefined
  let logContent: string = ''
  const date = new Date()
  const year = date.getFullYear()
  const month = processDate(date.getMonth() + 1)
  const day = processDate(date.getDate())
  const filename = `${year}-${month}-${day}.log`
  for (let logInfo of logInfoSet) {
    if (!logDir) {
      logDir = logInfo.logDir
    }
    logContent += `\r\n${logInfo.content}`
  }
  const fileDir = `${logDir}${type}`
  await checkFolderExistence(fileDir)
  const filePath = `${fileDir}/${filename}`
  const isFile = await checkFileExistence(filePath)
  await witerFileHandler(filePath, `\r\n${logContent}`, isFile)
}

const writeFileAction = async (logDir: string) => {
  await checkFolderExistence(logDir)
  const allLogInfo = logInfoMap.get('all')
  if (allLogInfo) {
    writeFileHandler('', allLogInfo)
  } else {
    for (let key of logInfoMap.keys()) {
      const singleLogInfo = logInfoMap.get(key)
      if (singleLogInfo) {
        writeFileHandler(`/${key}`, singleLogInfo)
      }
    }
  }
  logInfoMap.clear()
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
