import {run} from '../run'
import {join} from 'path'
import {mkdirSync} from 'fs'

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
