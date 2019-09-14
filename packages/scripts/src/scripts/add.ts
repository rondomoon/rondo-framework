import * as fs from 'fs'
import * as log from '../log'
import * as path from 'path'
import {argparse, arg} from '@rondo.dev/argparse'
import {run} from '../run'

export async function add(...argv: string[]) {
  const {parse} = argparse({
    name: arg('string', {positional: true, required: true}),
    namespace: arg('string', {default: '@rondo.dev'}),
    template: arg('string', {
      default: path.join(__dirname, '..', '..', 'template'),
      alias: 't',
      description: 'Path to project template directory',
    }),
    help: arg('boolean', {
      alias: 'h',
      description: 'Print help message',
    }),
    // frontend: arg('boolean', {alias: 'f'}),
  }, 'Create a new library from template')
  const args = parse(argv)

  const destDir = path.join('./packages', args.name)

  log.info('mkdir %s', destDir)
  fs.mkdirSync(destDir)

  const libraryName = `${args.namespace}/${args.name}`

  const templateDir = args.template
  for (const file of await walk(templateDir)) {
    const src = file
    const dest = path.join(destDir, path.relative(templateDir, file))
    if (dest === path.join(destDir, 'package.json')) {
      log.info('Add %s', dest)
      const libPkg = JSON.parse(fs.readFileSync(src, 'utf8'))
      libPkg.name = libraryName
      fs.writeFileSync(dest, JSON.stringify(libPkg, null, '  '))
    } else {
      log.info('Copy %s', src)
      fs.copyFileSync(src, dest)
    }
  }

  log.info('Update main package.json')
  const pkgFile = path.join(process.cwd(), 'package.json')
  const pkg = require(pkgFile)
  pkg.dependencies = pkg.dependencies || {}
  pkg.dependencies[libraryName] = `file:packages/${args.name}`
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, '  '))
}

export async function walk(
  file: string,
  files: string[] = [],
): Promise<string[]> {
  files.push(file)
  const stat = fs.statSync(file)
  if (stat.isDirectory()) {
    for (const f of fs.readdirSync(file)) {
      walk(path.join(file, f), files)
    }
  }
  return files
}
