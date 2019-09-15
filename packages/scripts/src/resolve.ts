import * as commands from './scripts'
import {join} from 'path'
import { TCommand } from './TCommand'

export type AvailableCommands = typeof commands & Record<string, TCommand>

export async function resolve(cwd = process.cwd()): Promise<AvailableCommands> {
  let extraScripts: Record<string, TCommand> = {}
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
