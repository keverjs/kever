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
      moduleRootPath = `${baseDir}/src/app`
    } else {
      let tsconfigPath = `${baseDir}/${tsconfigFileName}`
      const tsconfigTxt = await readFile(tsconfigPath, {
        encoding: 'utf8',
      })
      const tsconfig = JSON.parse(tsconfigTxt)
      const outDir = tsconfig.compilerOptions.outDir
      moduleRootPath = `${baseDir}/${outDir}/app`
    }
    // controller
    const controllerModuleRootPath = `${moduleRootPath}/controller`
    // service
    const serviceModuleRootPath = `${moduleRootPath}/service`
    // model
    const modelModuleRootPath = `${moduleRootPath}/model`
    // middleware
    const middlewareModuleRootPath = `${moduleRootPath}/middleware`
    // Other
    const otherModuleRootPath = modulePath.map(
      (module) => `${moduleRootPath}/${module}`
    )
    const [controllersPath, servicesPath, middlewaresPath, modelsPath] =
      await Promise.all([
        getFilesPath(controllerModuleRootPath),
        getFilesPath(serviceModuleRootPath),
        getFilesPath(middlewareModuleRootPath),
        getFilesPath(modelModuleRootPath),
      ])
    const otherModulesPath = await Promise.all(
      otherModuleRootPath.map((rootPath) => getFilesPath(rootPath))
    )

    const allMiddlewarePath = middlewares.concat([...middlewaresPath])
    const loadAllMiddlewarePath = allMiddlewarePath.map((path) =>
      loadFile(path)
    )
    const loadModelPath = Array.from(modelsPath).map((path) => loadFile(path))
    const loadModulePath = [...controllersPath, ...servicesPath].map((path) =>
      loadFile(path)
    )

    const loadOtherPath = otherModulesPath
      .map((paths) => [...paths])
      .flat()
      .map((path) => loadFile(path))

    await Promise.all(loadAllMiddlewarePath)
    await Promise.all(loadModelPath)
    await Promise.all(loadModulePath)
    await Promise.all(loadOtherPath)
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}
