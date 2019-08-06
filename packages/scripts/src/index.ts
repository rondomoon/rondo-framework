#!/usr/bin/env node
import * as commands from './commands'
import * as log from './log'
import {TCommand} from './TCommand'

async function run(...argv: string[]) {
  const commandName = argv[0]
  if (!(commandName in commands)) {
    const c = Object.keys(commands).filter(cmd => !cmd.startsWith('_'))
    log.info(`Available commands:\n\n${c.join('\n')}`)
    return
  }
  const command = (commands as any)[commandName] as TCommand
  await command(...argv.slice(1))
}

if (typeof require !== 'undefined' && require.main === module) {
  run(...process.argv.slice(2))
  .catch(err => {
    log.error('> ' + err.message)
    process.exit(1)
  })
}
