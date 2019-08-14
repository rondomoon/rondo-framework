#!/usr/bin/env node
import * as commands from './commands'
import * as log from './log'
import {TCommand} from './TCommand'
import {argparse, arg} from '@rondo/argparse'

const commandNames = Object.keys(commands).filter(cmd => !cmd.startsWith('_'))

const {parse} = argparse({
  help: arg('boolean', {alias: 'h'}),
  debug: arg('boolean'),
  command: arg('string[]', {
    n: '+',
    required: true,
    positional: true,
    description: '\n    ' + commandNames.join('\n    '),
  }),
})

type TArgs = ReturnType<typeof parse>

async function run(args: TArgs, exit: (code: number) => void) {
  const commandName = args.command[0]
  if (!(commandName in commands)) {
    const c = commandNames
    log.info(
      'Invalid command! Use the --help argument to see a list of commands')
    exit(1)
    return
  }
  const command = (commands as any)[commandName] as TCommand
  await command(...args.command)
}

async function start(
  argv: string[] = process.argv.slice(1),
  exit = (code: number) => process.exit(code),
) {
  let args: TArgs | null = null
  try {
    args = parse(argv)
    await run(args, exit)
  } catch (err) {
    log.error((args && args.debug ? err.stack : err.message))
    exit(1)
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  start()
}
