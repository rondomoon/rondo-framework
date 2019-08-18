import * as commands from './scripts'
import {join} from 'path'

export async function resolve(cwd = process.cwd()) {
  let extraScripts: object = {}
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
