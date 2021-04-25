import * as fs from 'fs'
import { parentPort } from 'worker_threads'
const { stat, appendFile, writeFile } = fs.promises
import { _checkFolderExistence, _processDate } from './utils'
import { LogInfoType } from './writeFile'

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

const writeFileHandler = async (type: string, logInfoSet: Set<LogInfoType>) => {
  let logDir: string | undefined
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

if (parentPort) {
  parentPort.on('message', (data) => {
    if (data.type === 'message') {
      writeFileHandler(data.type, data.logInfoSet)
    }
    if (data.type === 'close') {
      process.exit()
    }
  })
}
