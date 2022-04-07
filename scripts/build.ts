import fs from 'fs/promises'
import inquirer from 'inquirer'
import typescript from 'rollup-plugin-typescript2'
import chalk from 'chalk'
import { rollup } from 'rollup'
import { resolve } from 'path'
import minimist from 'minimist'
import { Extractor, ExtractorConfig } from '@microsoft/api-extractor'

const args = minimist(process.argv.slice(2))

const getPackagesName = async () => {
  const allPackagesName = await fs.readdir(resolve('packages'))
  return allPackagesName
    .filter((packageName) => {
      const isHiddenFile = /^\./g.test(packageName)
      return !isHiddenFile
    })
    .filter(async (packageName) => {
      const pkg = await import(resolve(`packages/${packageName}/package.json`))
      return !pkg.private
    })
}

const getAnswersFromInquirer = async (packagesName) => {
  const choicePackageQuestion = {
    type: 'checkbox',
    name: 'packages',
    scroll: false,
    message: 'Select build repo(Support Multiple selection)',
    choices: packagesName.map((packageName) => ({
      value: packageName,
      packageName,
    })),
  }
  let { packages } = await inquirer.prompt(choicePackageQuestion)
  if (!packages.length) {
    console.log(
      chalk.yellow(`
        It seems that you did't make a choice.
  
        Please try it again.
      `)
    )
    return
  }
  if (packages.some((p: string) => p === 'all')) {
    packagesName.shift()
    packages = packagesName
  }
  const confirmPackageQuestion = {
    name: 'confirm',
    message: `Confirm build ${packages.join(' and ')} packages?`,
    type: 'list',
    choices: ['Y', 'N'],
  }
  const { confirm } = await inquirer.prompt(confirmPackageQuestion)
  if (confirm === 'N') {
    console.log(chalk.yellow('[release] cancelled.'))
    return
  }
  return packages
}

const cleanDir = async (dir: string) => {
  try {
    const stat = await fs.stat(dir)
    if (stat.isDirectory()) {
      await fs.rm(dir, {
        recursive: true,
      })
    }
  } catch (err) {}
}

const cleanPackagesOldDist = async (packagesName) => {
  await Promise.all(
    packagesName.map((name) => cleanDir(`packages/${name}/dist`))
  )
}

const cleanPackagesDtsDir = async (packageName) => {
  const dtsPath = resolve(`packages/${packageName}/dist/packages`)
  await cleanDir(dtsPath)
}

const cleanDist = async () => {
  const distPath = resolve('dist')
  cleanDir(distPath)
}

const pascalCase = (str) => {
  const re = /-(\w)/g
  const newStr = str.replace(re, function (match, group1) {
    return group1.toUpperCase()
  })
  return newStr.charAt(0).toUpperCase() + newStr.slice(1)
}

const formats = ['esm', 'cjs']
const packageOtherConfig = {
  core: {
    external: ['@kever/core', '@kever/ioc', '@kever/router', '@kever/logger'],
  },
  ioc: {
    external: ['@kever/core', '@kever/ioc', '@kever/router', '@kever/logger'],
  },
  router: {
    external: ['@kever/core', '@kever/ioc', '@kever/router', '@kever/logger'],
  },
  logger: {
    external: ['@kever/core', '@kever/ioc', '@kever/router', '@kever/logger'],
  },
  kever: {
    external: ['@kever/core', '@kever/ioc', '@kever/router', '@kever/logger'],
  },
}
const generateBuildConfigs = (packagesName) => {
  const packagesFormatConfig = packagesName.map((packageName) => {
    const formatConfigs = []
    for (let format of formats) {
      formatConfigs.push({
        packageName,
        config: {
          input: resolve(`packages/${packageName}/src/index.ts`),
          output: {
            name: pascalCase(packageName),
            file: resolve(`packages/${packageName}/dist/index.${format}.js`),
            inlineDynamicImports: true,
            format,
          },
          plugins: [
            typescript({
              verbosity: -1,
              tsconfig: resolve('tsconfig.json'),
              tsconfigOverride: {
                include: [`package/${packageName}/src`],
              },
            }),
          ],
          ...packageOtherConfig[packageName],
        },
      })
    }
    return formatConfigs
  })
  return packagesFormatConfig.flat()
}

const extractDts = (packageName) => {
  const extractorConfigPath = resolve(
    `packages/${packageName}/api-extractor.json`
  )
  const extractorConfig =
    ExtractorConfig.loadFileAndPrepare(extractorConfigPath)
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })
  return result
}

const buildEntry = async (packageConfig) => {
  try {
    const packageBundle = await rollup(packageConfig.config)
    await packageBundle.write(packageConfig.config.output)
    const extractResult = extractDts(packageConfig.packageName)
    await cleanPackagesDtsDir(packageConfig.packageName)
    if (!extractResult.succeeded) {
      console.log(chalk.red(`${packageConfig.packageName} d.ts extract fail!`))
    }
    console.log(chalk.green(`${packageConfig.packageName} build successful! `))
  } catch (err) {
    console.log('err', err)
    console.log(chalk.red(`${packageConfig.packageName} build fail!`))
  }
}

const build = async (packagesConfig) => {
  for (let config of packagesConfig) {
    await buildEntry(config)
  }
}

const buildBootstrap = async () => {
  const packagesName = await getPackagesName()
  let buildPackagesName = packagesName
  if (!args.all) {
    packagesName.unshift('all')
    const answers = await getAnswersFromInquirer(packagesName)
    if (!answers) {
      return
    }
    buildPackagesName = answers
  }
  await cleanPackagesOldDist(buildPackagesName)
  const packagesBuildConfig = generateBuildConfigs(buildPackagesName)
  await build(packagesBuildConfig)
  await cleanDist()
}

buildBootstrap().catch((err) => {
  console.log('err', err)
  process.exit(1)
})
