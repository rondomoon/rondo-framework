import { getPathVariable } from './modules'
import { Subprocess } from './Subprocess'

export interface RunOptions {
  cwd?: string
  env?: Record<string, string>
}

export async function run(command: string, args: string[], opts?: RunOptions) {
  const env = opts && opts.env || {}
  const cwd = opts && opts.cwd
  return new Subprocess(command, args, {
    ...process.env,
    PATH: getPathVariable(),
    FORCE_COLOR: '1',
    ...env,
  })
  .run(cwd)
}
