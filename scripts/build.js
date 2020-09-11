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
      console.log(chalk.red(`remove ${packageName} dist dir error!`))
    }
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
            tsconfig: resolve(__dirname, '../tsconfig.json'),
            tsconfigOverride: {
              compilerOptions: {
                rootDir: resolve(__dirname, `../packages/${packagesName}`),
              },
              include: [`package/${packageName}/src`],
            },
          }),
        ],
      },
    }
  })
}
const buildEntry = async (packageConfig) => {
  const packageBundle = await rollup.rollup(packageConfig.config)
  await packageBundle.write(packageConfig.config.output)
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
  build(packagesConfig)
}

buildBootstrap().catch((err) => {
  console.log(err)
  process.exit(1)
})
