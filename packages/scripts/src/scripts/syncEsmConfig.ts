import * as fs from 'fs'
import * as path from 'path'
import {argparse, arg} from '@rondo.dev/argparse'
import {info} from '../log'

const TSCONFIG_FILENAME = 'tsconfig.json'
const TSCONFIG_ESM_FILENAME = 'tsconfig.esm.json'
const PKG_DIRNAME = 'packages'

interface IRef {
  path: string
}

export async function syncEsmConfig(...argv: string[]) {
  const args = argparse({
    packages: arg('string', {default: 'packages/', positional: true}),
    help: arg('boolean', {alias: 'h'}),
  }, `Synchronizes ${TSCONFIG_ESM_FILENAME} files with ${TSCONFIG_FILENAME}`)
  .parse(argv)

  const pkgDir = args.packages

  const projects = fs.readdirSync(pkgDir)
  .filter(file => {
    const stat = fs.lstatSync(path.join(pkgDir, file))
    return stat.isDirectory()
  })
  .map(file => path.join(pkgDir, file, TSCONFIG_FILENAME))
  .filter(file => fs.existsSync(file))
  .forEach(file => {
    const tsconfig = JSON.parse(fs.readFileSync(file, 'utf8'))
    const references = ((tsconfig.references || []) as IRef[])
    .map(ref => ({
      ...ref,
      path: path.join(ref.path, TSCONFIG_ESM_FILENAME),
    }))

    const tsconfigEsm = {
      extends: `./${TSCONFIG_FILENAME}`,
      compilerOptions: {
        outDir: 'esm',
      },
      references,
    }

    const dirname = path.dirname(file)
    const esmFile = path.join(dirname, TSCONFIG_ESM_FILENAME)
    info('Writing %s', esmFile)
    fs.writeFileSync(esmFile, JSON.stringify(tsconfigEsm, null, '  '))

    const pkgFile = path.join(dirname, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    pkg.module = 'lib/index.js'
    pkg.module = pkg.main ? pkg.main.replace(/^lib/, 'esm') : 'lib/index.js'

    info('Writing %s', pkgFile)
    fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, '  '))
  })
}
