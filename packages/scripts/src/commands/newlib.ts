import {argparse, arg, isHelp} from '@rondo/argparse'
import {run} from '../run'
import * as fs from 'fs'
import * as path from 'path'

export async function newlib(...argv: string[]) {
  const {parse, help} = argparse({
    name: arg('string', {positional: true, required: true}),
    namespace: arg('string', {default: '@rondo'}),
    help: arg('boolean', {
      alias: 'h',
      description: 'Print help message',
    }),
    // frontend: arg('boolean', {alias: 'f'}),
  })
  if (isHelp(argv)) {
    console.log('Usage: rondo newlib ' + help())
    return
  }
  const args = parse(argv)

  const destDir = path.join('./packages', args.name)

  console.log('mkdir %s', destDir)
  fs.mkdirSync(destDir)

  const libraryName = `${args.namespace}/${args.name}`

  const templateDir = path.join('.', 'template')
  for (const file of await walk(templateDir)) {
    const src = file
    const dest = path.join(destDir, path.relative(templateDir, file))
    if (dest === path.join(destDir, 'package.json')) {
      console.log('Add %s', dest)
      const libPkg = JSON.parse(fs.readFileSync(src, 'utf8'))
      libPkg.name = libraryName
      fs.writeFileSync(dest, JSON.stringify(libPkg, null, '  '))
    } else {
      console.log('Copy %s', src)
      fs.copyFileSync(src, dest)
    }
  }

  console.log('Update main package.json')
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
