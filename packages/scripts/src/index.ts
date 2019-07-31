#!/usr/bin/env node
import * as commands from './commands'
import {TCommand} from './TCommand'

async function run(...argv: string[]) {
  const commandName = argv[0] || 'help'
  if (!(commandName in commands)) {
    throw new Error('Command not found:' + commandName)
  }
  const command = (commands as any)[commandName] as TCommand
  await command(...argv.slice(1))
}

if (typeof require !== 'undefined' && require.main === module) {
  run(...process.argv.slice(2))
}
