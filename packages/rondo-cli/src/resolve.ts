import { join } from 'path'
import { Command } from './Command'
import * as commands from './scripts'

export type AvailableCommands = typeof commands & Record<string, Command>

export async function resolve(cwd = process.cwd()): Promise<AvailableCommands> {
  let extraScripts: Record<string, Command> = {}
  try {
    extraScripts = await import(join(cwd, './src/scripts'))
  } catch (err) {
    try {
      extraScripts = await import(join(cwd, './lib/scripts'))
    } catch (err) {
      // ignore
    }
  }

  return {
    ...commands,
    ...extraScripts,
  }
}
