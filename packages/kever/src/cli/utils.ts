import { exec } from 'node:child_process'
import { stat } from 'node:fs/promises'
import { dirname as _dirname } from 'node:path'
import { fileURLToPath} from 'url'
import ora from 'ora'
import logSymbols from 'log-symbols'
import { rimrafSync } from 'rimraf'

/**
 * @description Determine whether the path exists
 * @param path string
 * @returns boolean
 */
export const exists = async (path: string) => {
  try {
    await stat(path)
    return true
  } catch(e) {
    return false
  }
}

/**
 * @description Determine whether the path is a directory
 * @param path string
 * @returns boolean
 */
export const isDir = async (path: string) => {
  try {
    return (await stat(path)).isDirectory()
  } catch(e) {
    return false
  }
}

/**
 * @description Determine whether the path is a file
 * @param path 
 * @returns 
 */
export const isFile = async (path: string) => {
  try {
    return (await (stat(path))).isFile()
  } catch(e) {
    return false
  }
}

/**
 * ES Module dirname
 * @returns 
 */
export const dirname = () => typeof __dirname !== 'undefined' ? __dirname : _dirname(fileURLToPath(import.meta.url))

/**
* clone git project
*/
export const gitClone = (projectName: string, gitUrl: string, rmGit = true): Promise<boolean> => {
  const cmdStr = `git clone ${gitUrl} ${projectName}`;
  const spinner = ora('Loading template, please wait...')
  return new Promise((resolve, reject) => {
    spinner.start()
    exec(cmdStr, (err) => {
      let stopOptions = {
        symbol: logSymbols.success,
        text: 'Template loading complete'
      }
      if (err) {
        reject(err.message)
        stopOptions = {
          symbol: logSymbols.error,
          text: 'Template loading failure'
        }
      }
      resolve(true)
      spinner.stopAndPersist(stopOptions)
      rmGit && rimrafSync(`./${projectName}.git`)
    })
  })
}
