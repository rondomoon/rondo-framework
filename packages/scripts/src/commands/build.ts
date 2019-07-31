import * as childProcess from 'child_process'

export async function build(path: string) {
  // TODO fix this
  await childProcess.spawn('npx', ['ttsc', '--build', path], {
    stdio: 'inherit',
  })
}
