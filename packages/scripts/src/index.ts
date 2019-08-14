#!/usr/bin/env node
import * as commands from './commands'
import * as log from './log'
import {TCommand} from './TCommand'
import {argparse, arg} from '@rondo/argparse'

const {parse} = argparse({
  help: arg('boolean'),
  debug: arg('boolean'),
  command: arg('string[]', {n: '+', required: true, positional: true}),
})

type TArgs = ReturnType<typeof parse>

async function run(args: TArgs) {
  const commandName = args.command[0]
  if (!(commandName in commands)) {
    const c = Object.keys(commands).filter(cmd => !cmd.startsWith('_'))
    log.info(`Available commands:\n\n${c.join('\n')}`)
    return
  }
  const command = (commands as any)[commandName] as TCommand
  await command(...args.command)
}

if (typeof require !== 'undefined' && require.main === module) {
  const args = parse(process.argv.slice(1))
  run(args)
  .catch(err => {
    log.error('> ' + (args.debug ? err.stack : err.message))
    process.exit(1)
  })
}
