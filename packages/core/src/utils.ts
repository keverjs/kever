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
    logger.error(err)
  }
  return filesPath
}

export const loadFile = async (filePath: string) => {
  try {
    await require(filePath)
  } catch (err) {
    logger.error(err)
  }
}
