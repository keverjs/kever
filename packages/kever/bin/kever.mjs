#!/usr/bin/env node --harmony

import { program } from 'commander'
import { readPackage } from 'read-pkg'
import cli from '../dist/cli.mjs'

const run = async () => {
    const { version } = await readPackage()
    program.version(version, '-v, -V, --version')
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
