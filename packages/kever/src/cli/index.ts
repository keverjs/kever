import { resolve } from 'node:path'
import { rimrafSync } from 'rimraf'
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
  await initialTemplate(name)
}
