#!/usr/bin/env node --harmony

import { dirname as _dirname, resolve } from 'path'
import { fileURLToPath} from 'url'
import { program } from 'commander'
import { readPackage } from 'read-pkg'
import cli from '../dist/index.mjs'

// eslint-disable-next-line no-undef
const dirname = () => typeof __dirname !== 'undefined' ? __dirname : _dirname(fileURLToPath(import.meta.url))


const run = async () => {
    const { version } = await readPackage({
        cwd: resolve(dirname(), '..')
    })
    program.version(version, '-v, -V')
    program
        .command('init')
        .description('initial keverjs program')
        .alias('i')
        .action(() => {
            cli()
        })
    // eslint-disable-next-line no-undef
    program.parse(process.argv)

    if (!program.args.length) {
        program.help()
    }
}

run().catch(err => {
    // eslint-disable-next-line no-undef
    console.error(`[Kever Error]: ${err}`)
})
