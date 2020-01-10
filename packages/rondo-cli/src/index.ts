#!/usr/bin/env node
import { arg, argparse } from '@rondo.dev/argparse'
import { Command } from './Command'
import * as log from './log'
import { resolve } from './resolve'
import { getHelp } from './util/getHelp'

async function run(
  commandName: string,
  commandArgs: string[],
  commands: Record<string, Command>,
  exit: (code: number) => void,
) {
  if (!(commandName in commands)) {
    log.info(
      'Invalid command! Use the --help argument to see a list of commands')
    exit(1)
    return
  }
  const command = commands[commandName]
  await command(commandName, ...commandArgs)
}

async function start(
  argv: string[] = process.argv.slice(1),
  exit = (code: number) => process.exit(code),
) {
  const commands = await resolve()
  const choices = Object.keys(commands)
  .filter(c => !c.startsWith('_') && typeof commands[c] === 'function')

  const desc = 'Commands:\n  ' + choices
  .filter(choice => typeof commands[choice] === 'function')
  .map(choice => getHelp(commands[choice]))
  .join('\n  ')

  const {parse} = argparse({
    help: arg('boolean', {alias: 'h'}),
    debug: arg('boolean'),
    command: arg('string', {
      required: true,
      positional: true,
      choices,
    }),
    args: arg('string[]', {
      n: '*',
      positional: true,
    }),
  }, desc)

  let args: ReturnType<typeof parse> | null = null
  try {
    args = parse(argv)
    await run(args.command, args.args, commands, exit)
  } catch (err) {
    log.error((args && args.debug ? err.stack : err.message))
    exit(1)
  }
}

if (typeof require !== 'undefined' && require.main === module) {
  start()
}
