import { gitClone } from './utils'

export const enum TemplateName {
  Kever = 'kever'
}

const DEFAULT_TEMPLATE = TemplateName.Kever

const TEMPLATES: Record<TemplateName, string> = {
  [TemplateName.Kever]: 'https://github.com/keverjs/template.git'
}

export const initialTemplate = async (projectName: string, tplName: TemplateName = DEFAULT_TEMPLATE) => {
  const git = TEMPLATES[tplName] || TEMPLATES[TemplateName.Kever]
  try {
    // clone tempalte
    await gitClone(projectName, git)
    return true
  } catch(_err) {
    return false
  }
}
