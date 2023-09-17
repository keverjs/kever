import inquirer, { QuestionCollection } from 'inquirer'

export const createProjectQuestion = () => {
  const questions: QuestionCollection[] = [{
    type: 'input',
    name: 'projectName',
    message: 'Project name',
    default: 'project-name',
    validate: (value: string) => {
      if (value.match(/\w+/)) {
        return true
      }
      return 'error'
    }
  }]

  return inquirer.prompt(questions)
}

export const createOverrideQuestion = (name: string) => {
  const questions: QuestionCollection[] = [{
    type: 'confirm',
    name: 'override',
    message: `${name} already exists, is it covered?`
  }]
  return inquirer.prompt(questions)
}
