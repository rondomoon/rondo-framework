import {run} from '../run'

export async function watch(path: string) {
  await run('ttsc', ['--build', '--watch', '--preserveWatchOutput',  path])
}
