import { existsSync, statSync, promises } from 'node:fs'
import { join } from 'node:path'
import type { Logger } from '@kever/core'

/**
 * get files path in dir
 * @param loadFileDir 
 * @returns 
 */
export const getFilesPath = async (loadFileDir: string, logger: Logger) => {
  let filesPath: Set<string> = new Set()
  try {
    async function findFile(path: string) {
      if (!existsSync(path)) {
        return
      }
      let files = await promises.readdir(path)
      for (let file of files) {
        const fpath = join(path, file)
        const stats = statSync(fpath)
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

/**
 * load module
 * @param filePath 
 */
export const loadModule = async (filePath: string, logger: Logger) => {
  try {
    await require(filePath)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}

const getPkg = async (): Promise<Record<string, unknown>> => {
  try {
    const root = process.cwd()
    return require(`${root}/package.json`)
  } catch(_) {
    return {}
  }
}

/**
 * get project version by package.json
 * @returns 
 */
export const getAppVersion = async () => {
  const pkg = await getPkg()
  return pkg.version
}

/**
 * get project name by package.json
 * @returns 
 */
export const getProjectName = async () => {
  const pkg = await getPkg()
  return pkg.name
}

const COLOR_LEN = 10
/**
 * fillLine
 * @param data 
 * @param len 
 * @param pad 
 * @param subPad 
 * @returns 
 */
export const fillLine = (data: string | [string, string][], len = 49, pad = ' ', subPad = '.') => {
  if (data.length === 0) {
    return pad.padEnd(len)
  }
  if (typeof data === 'string') {
    len += COLOR_LEN
    const padNum = (len - data.length) / 2
    return `${pad.padEnd(padNum)}${data}`.padEnd(len, pad)
  } else {
    len += data.flat().length * COLOR_LEN
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
