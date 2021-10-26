import * as fs from 'fs'
const { stat, mkdir, appendFile, writeFile } = fs.promises

export const processDate = (date: number): string | number => {
  return date < 10 ? `0${date}` : date
}

/**
 * @description 检查log目录是否存在，不存在则创建
 * @param logDir
 */
export const checkFolderExistence = async (logDir: string) => {
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
export const checkFileExistence = async (filename: string) => {
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
export const witerFileHandler = async (
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
