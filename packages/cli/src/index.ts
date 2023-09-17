import { resolve } from 'node:path'
import { rimrafSync } from 'rimraf'
import chalk from 'chalk'
import { readPackage } from 'read-pkg'
import updateNotifier from 'update-notifier'
import { createProjectQuestion, createOverrideQuestion } from './question'
import { initialTemplate } from './template'
import { exists, dirname } from './utils'

const projectQuestions = async () => {
  let finalName: string = ''
  while (!finalName) {
    const { projectName } = await createProjectQuestion()
    const projectPath = resolve(process.cwd(), projectName)
    if (await exists(projectPath)) {
      const { override } = await createOverrideQuestion(projectName)
      if (!override) {
        continue
      }
      rimrafSync(projectPath)
    }
    finalName = projectName
  }
  return finalName
}

const versionUpateNotify = async () => {
  try {
    const pkg = await readPackage({
      cwd: resolve(dirname(), '..')
  })
    updateNotifier({ pkg }).notify()
  } catch(_err) { /* empty */ }
}

export default async () => {
  await versionUpateNotify()
  const name = await projectQuestions()
  const inited = await initialTemplate(name)

  if (inited) {
    console.log(`\nDone. Now run:
  
      ${chalk.green(`cd ${name}`)}
      ${chalk.green('npm install')}
      ${chalk.green('npm run dev')}
    `)
  }
}
