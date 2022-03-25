import { getFilesPath, loadFile } from './utils'
import { logger } from '@kever/logger'
import * as fs from 'fs'
const { readFile } = fs.promises

export const loadModules = async (
  middlewares: string[],
  modulePath: string[],
  env: string,
  tsconfigFileName: string
) => {
  try {
    const baseDir = process.cwd()
    let moduleRootPath: string
    if (env === 'development') {
      moduleRootPath = `${baseDir}/src`
    } else {
      let tsconfigPath = `${baseDir}/${tsconfigFileName}`
      const tsconfigTxt = await readFile(tsconfigPath, {
        encoding: 'utf8',
      })
      const tsconfig = JSON.parse(tsconfigTxt)
      const outDir = tsconfig.compilerOptions.outDir
      moduleRootPath = `${baseDir}/${outDir}`
    }
    const moduleFilesPath = getFilesPath(`${moduleRootPath}/app`)
    const otherModulesRootPath = modulePath.map((module) =>
      getFilesPath(`${moduleRootPath}/${module}`)
    )

    const allModulesPath = (
      await Promise.all([moduleFilesPath, ...otherModulesRootPath])
    )
      .map((modules) => [...modules])
      .flat()
      .concat(middlewares)

    await Promise.all(allModulesPath.map((path) => loadFile(path)))
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}
