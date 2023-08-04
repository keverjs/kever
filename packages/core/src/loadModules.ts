import { readFile } from 'node:fs/promises'
import { getFilesPath, loadModule } from '@kever/shared'
import { type AppOptions, Env } from './application'

export const loadModules = async (middlewares: string[], options: Required<AppOptions>) => {
  const { env, tsconfig: tsconfigFileName, modulePath, logger } = options
  const baseDir = process.cwd()
  try {
    let moduleRootPath: string
    if (env === Env.DEV) {
      moduleRootPath = `${baseDir}/src`
    } else {
      let tsconfigPath = `${baseDir}/${tsconfigFileName}`
      const tsconfigTxt = await readFile(tsconfigPath, { encoding: 'utf8' })
      const tsconfig = JSON.parse(tsconfigTxt)
      const outDir = tsconfig.compilerOptions.outDir
      moduleRootPath = `${baseDir}/${outDir}`
    }
    const moduleFilesPath = getFilesPath(`${moduleRootPath}/app`, logger)
    const otherModulesRootPath = modulePath.map((module) => getFilesPath(`${moduleRootPath}/${module}`, logger))

    const allModulesPath = (
      await Promise.all([moduleFilesPath, ...otherModulesRootPath])
    )
      .map((modules) => [...modules])
      .flat()
      .concat(middlewares)

    await Promise.all(allModulesPath.map((path) => loadModule(path, logger)))
  } catch (err) {
    logger.error(`${err.message} \n ${err.stack}`)
  }
}
