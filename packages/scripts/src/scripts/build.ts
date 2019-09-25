import * as fs from 'fs'
import * as p from 'path'
import {argparse, arg} from '@rondo.dev/argparse'
import {findNodeModules} from '../modules'
import {join} from 'path'
import {run} from '../run'

const tsc = 'ttsc'

export async function build(...argv: string[]) {
  const {parse} = argparse({
    project: arg('string', {
      alias: 'p',
      default: '.',
      description: 'Project to build',
      positional: true,
    }),
    esm: arg('boolean', {
      description: 'Build project from tsconfig.esm.json',
    }),
    watch: arg('boolean', {
      alias: 'w',
      description: 'Watch for changes',
    }),
    help: arg('boolean', {alias: 'h'}),
  })
  const args = parse(argv)
  const path = args.esm ? join(args.project, 'tsconfig.esm.json') : args.project
  const watchArgs = args.watch ? ['--watch', '--preserveWatchOutput'] : []
  await run(tsc, ['--build', path, ...watchArgs])
}

export async function test(...argv: string[]) {
  const {args} = argparse({
    args: arg('string[]', {
      n: '*',
      positional: true,
    }),
    help: arg('boolean', {alias: 'h'}),
  })
  .parse(argv)
  await run('jest', args)
}

export async function exec(...argv: string[]) {
  const {parse} = argparse({
    file: arg('string', {
      required: true,
      positional: true,
    }),
    args: arg('string[]', {
      n: '*',
      positional: true,
    }),
    help: arg('boolean', {alias: 'h'}),
  })
  const args = parse(argv)
  const {file} = args
  const command = file.endsWith('.ts') ? 'ts-node' : 'node'
  const nodeArgs = command === 'ts-node' ?
    [
      '--files',
      '--project',
      findTsConfig(file),
    ] : []
  await run(command, [...nodeArgs, file, ...args.args])
}

export async function createMigration(...argv: string[]) {
  const args = argparse({
    name: arg('string', {required: true, positional: true}),
    project: arg('string', {alias: 'p', default: '.'}),
    help: arg('boolean', {alias: 'h'}),
  })
  .parse(argv)

  const {name, project} = args

  const typeorm = findNodeModules(project)
  .map(nm => p.join(nm, 'typeorm'))
  .find(t => fs.existsSync(t))
  if (!typeorm) {
    throw new Error('typeorm not found')
  }
  await run('ts-node', [typeorm, 'migration:generate', '--name', name], project)
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

async function browserify(path = '.', ...extraArgs: string[]) {
  // mkdirSync(join(path, 'build'), {recursive: true})
  await run('browserify', [
    join(path, 'esm', 'index.js'),
    '-g', '[', 'loose-envify', 'purge', '--NODE_ENV', 'production', ']',
    '-p', '[', 'esmify', ']',
    '-p', '[', 'common-shakeify', '-v', ']',
    '-v', '-o', join(path, 'build', 'client.prod.js'),
    ...extraArgs,
  ])
}

async function uglify(path = '.') {
  await run('uglifyjs', [
    '--compress',
    '--mangle',
    '--source-map',
    '-o', join(path, 'build', 'client.js'),
    '--',
    join(path, 'build', 'client.prod.js'),
  ])
}

export async function js(...argv: string[]) {
  const args = argparse({
    path: arg('string', {positional: true, default: '.'}),
    watch: arg('boolean', {alias: 'w'}),
    help: arg('boolean', {alias: 'h'}),
  })
  .parse(argv)

  const {path, watch} = args
  return watch ? watchJs(path) : buildJs(path)
}

async function buildJs(path: string) {
  await build(...['-p', path, '--esm'])
  await browserify(path)
  await uglify(path)
}

async function watchJs(path: string, ...extraArgs: string[]) {
  await run('watchify', [
    join(path, 'esm', 'index.js'),
    // '-p', '[', 'tsify', '--project', path, ']',
    '-g', '[', 'loose-envify', 'purge', '--NODE_ENV', 'development', ']',
    '-v',
    '--debug',
    '-o',
    join(path, 'build', 'client.js'),
    ...extraArgs,
  ])
}

export async function css(...argv: string[]) {
  const args = argparse({
    path: arg('string', {positional: true, default: '.'}),
    watch: arg('boolean', {alias: 'w'}),
    help: arg('boolean', {alias: 'h'}),
  })
  .parse(argv)

  const {path, watch} = args

  if (watch) {
    await watchCss(path)
  }

  await run('node-sass', [
    '--output-style', 'compressed',
    '--output', join(path, 'build'),
    join(path, 'scss'),
  ])
}

async function watchCss(path = '.') {
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

export async function frontend(...argv: string[]) {
  const args = argparse({
    path: arg('string', {positional: true, default: '.'}),
    'full-paths': arg('boolean'),
    help: arg('boolean', {alias: 'h'}),
  })
  .parse(argv)
  const {path} = args
  const watchArgs = []
  if (args['full-paths']) {
    watchArgs.push('--full-paths')
  }
  await build(...['-p', path])
  const promises = [
    build(...['-p', path, '--watch']),
    watchJs(path, ...watchArgs),
    watchCss(path),
  ]
  await Promise.all(promises)
}
