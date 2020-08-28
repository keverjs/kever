const execa = require('execa')
const path = require('path')

run()
async function run() {
  await execa('tsc', [], { stdio: 'inherit' })
  // build d.ts
  const { Extractor, ExtractorConfig } = require('@microsoft/api-extractor')
  const extractorConfigPath = path.join(__dirname, '../api-extractor.json')
  const extractorConfig = ExtractorConfig.loadFileAndPrepare(
    extractorConfigPath
  )
  const result = Extractor.invoke(extractorConfig, {
    localBuild: true,
    showVerboseMessages: true,
  })
  if (result.succeeded) {
    console.log('build  successfully')
    process.exitCode = 0
  } else {
    console.error(
      `API Extractor completed with ${result.errorCount} errors` +
        ` and ${result.warningCount} warnings`
    )
    process.exitCode = 1
  }
}
