#!/usr/bin/env node
import * as log from './log'
import {TCommand} from './TCommand'
import {argparse, arg} from '@rondo.dev/argparse'
import {resolve} from './resolve'

async function run(
  args: any, commands: object, exit: (code: number) => void,
) {
  const p = './scripts'
  const module = await import(p)
  const commandName = args.command
  if (!(commandName in commands)) {
    log.info(
      'Invalid command! Use the --help argument to see a list of commands')
    exit(1)
    return
  }
  const command = (commands as any)[commandName] as TCommand
  await command(args.command, ...args.args)
}

async function start(
  argv: string[] = process.argv.slice(1),
  exit = (code: number) => process.exit(code),
) {
  const commands = await resolve()
  const {parse} = argparse({
    help: arg('boolean', {alias: 'h'}),
    debug: arg('boolean'),
    command: arg('string', {
      required: true,
      positional: true,
      choices: Object.keys(commands).filter(c => !c.startsWith('_')),
    }),
    args: arg('string[]', {
      n: '*',
      positional: true,
    }),
  })

  let args: ReturnType<typeof parse> | null = null
  try {
    args = parse(argv)
    await run(args, commands, exit)
  } catch (err) {
    log.error((args && args.debug ? err.stack : err.message))
    exit(1)
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  start()
}
