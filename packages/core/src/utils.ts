import * as fs from 'fs'
import { promisify } from 'util'
import { join } from 'path'
import { logger } from '@kever/logger'
const readDirPromise = promisify(fs.readdir)

export const getFilesPath = async (loadFileDir: string) => {
  let filesPath: Set<string> = new Set()
  try {
    async function findFile(path: string) {
      if (!fs.existsSync(path)) {
        return
      }
      let files = await readDirPromise(path)
      for (let file of files) {
        const fpath = join(path, file)
        const stats = fs.statSync(fpath)
        if (stats.isDirectory()) {
          await findFile(fpath)
        }
        if (stats.isFile()) {
          filesPath.add(fpath)
        }
      }
    }
    await findFile(loadFileDir)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
  return filesPath
}

export const loadFile = async (filePath: string) => {
  try {
    await require(filePath)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}

export const getAppVersion = async () => {
  try {
    return require('../package.json').version
  } catch (_) {
    return ''
  }
}
export const getCurrentProjectName = async () => {
  try {
    const root = process.cwd()
    return require(`${root}/package.json`).name
  } catch (_) {
    return ''
  }
}
export const fillLine = (
  data: string | [string, string][],
  len = 49,
  pad = ' ',
  subPad = '.'
) => {
  if (data.length === 0) {
    return pad.padEnd(len)
  }
  if (typeof data === 'string') {
    const padNum = (len - data.length) / 2
    console.log('padNum', padNum, pad.padEnd(padNum).length)
    return `${pad.padEnd(padNum)}${data}`.padEnd(len, pad)
  } else {
    const subLen = (len - 1) / 2
    return data
      .reduce((line, sub) => {
        const subLine = `${sub[0].padEnd(subLen - sub[1].length, subPad)}${
          sub[1]
        }`
        return `${line} ${subLine}`
      }, '')
      .slice(1)
      .padEnd(len, pad)
  }
}
