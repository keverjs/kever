import { getFilesPath, loadFile } from './utils'
import { logger } from '@kever/logger'
import * as fs from 'fs'
const { readFile } = fs.promises

export const loadModules = async (
  plugins: string[],
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
    // plugin
    const pluginModuleRootPath = `${moduleRootPath}/plugin`
    const [
      controllersPath,
      servicesPath,
      pluginsPath,
      modelsPath,
    ] = await Promise.all([
      getFilesPath(controllerModuleRootPath),
      getFilesPath(serviceModuleRootPath),
      getFilesPath(pluginModuleRootPath),
      getFilesPath(modelModuleRootPath),
    ])

    const allPluginPath = plugins.concat([...pluginsPath])
    const loadAllPluginPath = allPluginPath.map((path) => loadFile(path))
    const loadModulePath = [
      ...modelsPath,
      ...controllersPath,
      ...servicesPath,
    ].map((path) => loadFile(path))

    await Promise.all(loadAllPluginPath)
    await Promise.all(loadModulePath)
  } catch (err) {
    logger.error(err)
  }
}
