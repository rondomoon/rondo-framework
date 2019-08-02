import {Subprocess} from './Subprocess'
import {getPathVariable} from './modules'

export async function run(command: string, args: string[], cwd?: string) {
  return new Subprocess(command, args, {
    ...process.env,
    PATH: getPathVariable(),
  })
  .run(cwd)
}
