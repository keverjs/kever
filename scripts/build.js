const fs = require('fs').promises
const { resolve } = require('path')
const inquirer = require('inquirer')
const rollup = require('rollup')
const typescript = require('rollup-plugin-typescript2')
const chalk = require('chalk')

const getPackagesName = async () => {
  const allPackagesName = await fs.readdir(resolve(__dirname, '../packages'))
  return allPackagesName
    .filter((packageName) => {
      const isHiddenFile = /^\./g.test(packageName)
      return !isHiddenFile
    })
    .filter((packageName) => {
      const isPrivatePackages = require(resolve(
        __dirname,
        `../packages/${packageName}/package.json`
      )).private
      return !isPrivatePackages
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
  if (packages.some((package) => package === 'all')) {
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

const cleanPackagesOldDist = async (packagesName) => {
  for (let packageName of packagesName) {
    const distPath = resolve(__dirname, `../packages/${packageName}/dist`)
    try {
      fs.rmdir(distPath, {
        recursive: true,
      })
    } catch (err) {
      console.log(chalk.red(`remove @kever/${packageName} dist dir error!`))
    }
  }
}

const cleanPackagesDtsDir = async (packageName) => {
  const dtsPath = resolve(__dirname, `../packages/${packageName}/dist/src`)
  try {
    fs.rmdir(dtsPath, {
      recursive: true,
    })
  } catch (err) {
    console.log(chalk.red(`remove ${packageName} dist/dts dir error!`))
  }
}

const PascalCase = (str) => {
  const re = /-(\w)/g
  const newStr = str.replace(re, function (match, group1) {
    return group1.toUpperCase()
  })
  return newStr.charAt(0).toUpperCase() + newStr.slice(1)
}

const generateBuildConfigs = (packagesName) => {
  return packagesName.map((packageName) => {
    return {
      packageName,
      config: {
        input: resolve(__dirname, `../packages/${packageName}/src/index.ts`),
        output: {
          dir: resolve(__dirname, `../packages/${packageName}/dist`),
          name: PascalCase(packageName),
          format: 'cjs',
        },
        plugins: [
          typescript({
            verbosity: -1,
            tsconfig: resolve(
              __dirname,
              `../packages/${packageName}/tsconfig.json`
            ),
            tsconfigOverride: {
              include: [`package/${packageName}/src`],
            },
          }),
        ],
      },
    }
  })
}

const extractDts = (packageName) => {
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')
  const extractorConfigPath = resolve(
    __dirname,
    `../packages/${packageName}/api-extractor.json`
  )
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  )
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })
  return result
}

const buildEntry = async (packageConfig) => {
  try {
    const packageBundle = await rollup.rollup(packageConfig.config)
    await packageBundle.write(packageConfig.config.output)
    const extractResult = extractDts(packageConfig.packageName)
    await cleanPackagesDtsDir(packageConfig.packageName)
    if (!extractResult.succeeded) {
      console.log(
        chalk.red(`@kever/${packageConfig.packageName} d.ts extract fial!`)
      )
    }
    console.log(
      chalk.green(`@kever/${packageConfig.packageName} build successful! `)
    )
  } catch (err) {
    console.log(chalk.red(`@kever/${packageConfig.packageName} build fial!`))
  }
}

const build = async (packagesConfig) => {
  for (let packageConfig of packagesConfig) {
    await buildEntry(packageConfig)
  }
}

const buildBootstrap = async () => {
  const packagesName = await getPackagesName()
  packagesName.unshift('all')
  const answers = await getAnswersFromInquirer(packagesName)
  if (!answers) {
    return
  }
  cleanPackagesOldDist(answers)
  const packagesConfig = generateBuildConfigs(answers)
  await build(packagesConfig)
}

buildBootstrap().catch((err) => {
  console.log(err)
  process.exit(1)
})
