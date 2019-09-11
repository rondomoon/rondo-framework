import rimraf from 'rimraf'
import {argparse, arg} from '@rondo.dev/argparse'
import { join, sep } from 'path'
import { promisify } from 'util'
import { info } from '../log'

const rimrafAsync = promisify(rimraf)

export async function clean(...argv: string[]) {
  const {parse} = argparse({
    project: arg('string', {
      alias: 'p',
      default: '.',
      description: 'Project to clean',
      positional: true,
    }),
    help: arg('boolean', {alias: 'h'}),
  })

  const args = parse(argv)

  const paths = [
    join(args.project, '*.tsbuildinfo'),
    join(args.project, 'lib' + sep),
    join(args.project, 'esm' + sep),
  ]

  for (const path of paths) {
    info('Removing: %s', path)
    await rimrafAsync(path)
  }
}
