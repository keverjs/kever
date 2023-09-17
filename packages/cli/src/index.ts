import { resolve } from 'node:path'
import { rimrafSync } from 'rimraf'
import chalk from 'chalk'
import { createProjectQuestion, createOverrideQuestion } from './question'
import { initialTemplate } from './template'
import { exists } from './utils'

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

export default async () => {
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
