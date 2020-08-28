import { _processDate } from './utils'
import * as fs from 'fs'
const { stat, mkdir, appendFile, writeFile } = fs.promises

interface logInfoType {
  type: string
  content: string
  logDir: string
  isDependentOutput: boolean
}
const logInfoMap = new Map<string, Set<logInfoType>>()
/**
 * @description 检查log目录是否存在，不存在则创建
 * @param logDir
 */
const _checkFolderExistence = async (logDir: string) => {
  try {
    await stat(logDir)
  } catch (err) {
    await mkdir(logDir)
  }
}
/**
 * 检查log文件是否存在，默认一天生成一个log文件，不存在则创建
 * @param logDir
 * @param filename
 */
const _checkFileExistence = async (filename: string) => {
  try {
    await stat(filename)
    return true
  } catch (err) {
    return false
  }
}
/**
 * @description 若文件存在则追加文件，否则写入文件
 * @param filePath
 * @param content
 * @param isFile
 */
const _witerFileHandler = async (
  filePath: string,
  content: string,
  isFile: boolean
) => {
  if (isFile) {
    await appendFile(filePath, content)
  } else {
    await writeFile(filePath, content)
  }
}

const writeFileHandler = async (type: string, logInfoSet: Set<logInfoType>) => {
  let logDir: string
  let logContent: string = ''
  const date = new Date()
  const year = date.getFullYear()
  const month = _processDate(date.getMonth() + 1)
  const day = _processDate(date.getDate())
  const filename = `${year}-${month}-${day}.log`
  for (let logInfo of logInfoSet) {
    if (!logDir) {
      logDir = logInfo.logDir
    }
    logContent += `\r\n${logInfo.content}`
  }
  const fileDir = `${logDir}${type}`
  await _checkFolderExistence(fileDir)
  const filePath = `${fileDir}/${filename}`
  const isFile = await _checkFileExistence(filePath)
  await _witerFileHandler(filePath, `\r\n${logContent}`, isFile)
}

const writeFileAction = async (logDir: string) => {
  await _checkFolderExistence(logDir)
  const isAll = logInfoMap.has('all')
  if (isAll) {
    writeFileHandler('', logInfoMap.get('all'))
  } else {
    for (let key of logInfoMap.keys()) {
      writeFileHandler(`/${key}`, logInfoMap.get(key))
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
    let logInfoSet: Set<logInfoType>
    if (logInfoMap.has(mapKey)) {
      logInfoSet = logInfoMap.get(mapKey)
    } else {
      logInfoSet = new Set<logInfoType>()
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
