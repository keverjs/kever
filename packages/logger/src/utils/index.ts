import * as fs from 'fs'
const { stat, mkdir } = fs.promises

export const _processDate = (date: number): string | number => {
  return date < 10 ? `0${date}` : date
}

/**
 * @description 检查log目录是否存在，不存在则创建
 * @param logDir
 */
export const _checkFolderExistence = async (logDir: string) => {
  try {
    await stat(logDir)
  } catch (err) {
    await mkdir(logDir)
  }
}
