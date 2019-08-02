import {run} from '../run'
import {join} from 'path'
import * as fs from 'fs'
import * as p from 'path'

const tsc = 'ttsc'

export async function build(path: string = '.') {
  await run(tsc, ['--build', path])
}

export async function buildEsm(path: string = '.') {
  await run(tsc, ['--build', join(path, 'tsconfig.esm.json')])
}

export async function watch(path: string = '.') {
  await run(tsc, ['--build', '--watch', '--preserveWatchOutput',  path])
}

export async function watchEsm(path: string = '.') {
  await run(tsc, [
    '--build',
    '--watch',
    '--preserveWatchOutput',
    join(path, 'tsconfig.esm.json'),
  ])
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
  return run(command, [...args, file])
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
  await buildEsm(path)
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
  await buildEsm(path)
  const promises = [
    watchEsm(path),
    watchJs(path),
    watchCss(path),
  ]
  return Promise.all(promises)
}
