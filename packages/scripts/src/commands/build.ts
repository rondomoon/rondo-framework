import {run} from '../run'

export async function build(path: string) {
  await run('ttsc', ['--build', path])
}
