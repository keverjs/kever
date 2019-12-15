#!/usr/bin/env node

const path = require('path')
const cp = require('child_process')
process.exitCode = 0

/**
 *
 * @param command
 * @param args
 */
const runCommand = (command, args) => {
  return new Promise((resolve, reject) => {
    const executedCommand = cp.spawn(command, args, {
      stdio: 'inherit',
      shell: true
    })

    executedCommand.on('error', error => {
      reject(error)
    })

    executedCommand.on('exit', code => {
      if (code === 0) {
        resolve()
      } else {
        reject()
      }
    })
  })
}

/**
 *
 * @param packageName
 */
const isInstalled = packageName => {
  try {
    console.log(packageName)
    require.resolve(packageName)
    return true
  } catch (err) {
    console.log(err)
    return false
  }
}

const mode = process.argv[2]
// 断言
if (mode !== 'dev' && mode !== 'prod') {
}

/**
 *
 */
const sunnierCLI = {
  name: 'sunnier-cli',
  package: 'sunnier-cli',
  installed: isInstalled('sunnier-cli'),
  recommended: true,
  description: 'sunnier cli'
}

console.log(sunnierCLI.installed)
if (sunnierCLI.installed) {
  const pkgPath = require.resolve(`${sunnierCLI.package}/package.json`)
  const pkg = require(pkgPath)
  require(path.resolve(path.dirname(pkgPath), pkg.bin[mode]))
} else {
  // TODO: 当cli不存在的时候，提示开发者去下载cli
  console.log('npm install sunnier-cli --save')
}
