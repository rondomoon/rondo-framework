import * as fs from 'fs'
import * as p from 'path'
import {argparse} from '@rondo/argparse'
import {findNodeModules} from '../modules'
import {join} from 'path'
import {run} from '../run'

const tsc = 'ttsc'

export async function build(...argv: string[]) {
  const {esm, project, watch} = argparse({
    project: {
      type: 'string',
      alias: 'p',
      default: '.',
    },
    esm: {
      type: 'boolean',
    },
    watch: {
      type: 'boolean',
      alias: 'w',
    },
  })(argv)
  const path = esm ? join(project, 'tsconfig.esm.json') : project
  const watchArgs = watch ? ['--watch', '--preserveWatchOutput'] : []
  await run(tsc, ['--build', path, ...watchArgs])
}

export async function test(...args: string[]) {
  await run('jest', args)
}

export async function exec(file: string) {
  const command = file.endsWith('.ts') ? 'ts-node' : 'node'
  const args = command === 'ts-node' ?
    [
      '--files',
      '--project',
      findTsConfig(file),
    ] : []
  await run(command, [...args, file])
}

export async function createMigration(project: string, name: string) {
  const typeorm = findNodeModules(project)
  .map(nm => p.join(nm, 'typeorm'))
  .find(t => fs.existsSync(t))
  if (!typeorm) {
    throw new Error('typeorm not found')
  }
  await run('ts-node', [typeorm, 'migration:create', '--name', name], project)
}

function findTsConfig(file: string): string {
  let lastPath = ''
  file = p.resolve(file, '..')
  while (file !== lastPath) {
    const tsconfig = p.join(file, 'tsconfig.json')
    if (fs.existsSync(tsconfig)) {
      return p.relative(process.cwd(), tsconfig)
    }
    lastPath = file
    file = p.resolve(file, '..')
  }
  return ''
}

export async function browserify(path: string = '.') {
  // mkdirSync(join(path, 'build'), {recursive: true})
  await run('browserify', [
    join(path, 'esm', 'index.js'),
    '--full-paths', // TODO this might be unneccessary
    '-g', '[', 'loose-envify', 'purge', '--NODE_ENV', 'production', ']',
    '-p', '[', 'esmify', ']',
    '-p', '[', 'common-shakeify', '-v', ']',
    '-v', '-o', join(path, 'build', 'client.prod.js'),
  ])
}

export async function uglify(path: string = '.') {
  await run('uglifyjs', [
    '--compress',
    '--mangle',
    '--source-map',
    '-o', join(path, 'build', 'client.js'),
    '--',
    join(path, 'build', 'client.prod.js'),
  ])
}

export async function js(path: string = '.') {
  await build(...['-p', path, '--esm'])
  await browserify(path)
  await uglify(path)
}

export async function watchJs(path: string = '.') {
  await run('watchify', [
    join(path, 'esm', 'index.js'),
    // '-p', '[', 'tsify', '--project', path, ']',
    '-g', '[', 'loose-envify', 'purge', '--NODE_ENV', 'development', ']',
    '-v',
    '--debug',
    '-o',
    join(path, 'build', 'client.js'),
  ])
}

export async function css(path = '.') {
  await run('node-sass', [
    '--output-style', 'compressed',
    '--output', join(path, 'build'),
    join(path, 'scss'),
  ])
}

export async function watchCss(path = '.') {
  await run('node-sass', [
    join(path, 'scss'),
    '--output', join(path, 'build'),
    '--source-map', 'true',
    '--source-map-contents',
    '--source-map-embed',
  ])
  await run('node-sass', [
    '--watch',
    join(path, 'scss'),
    '--output', join(path, 'build'),
    '--source-map', 'true',
    '--source-map-contents',
    '--source-map-embed',
  ])
}

export async function frontend(path = '.') {
  await build(...['-p', path, '--esm'])
  const promises = [
    build(...['-p', path, '--watch', '--esm']),
    watchJs(path),
    watchCss(path),
  ]
  return Promise.all(promises)
}
