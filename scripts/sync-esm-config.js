#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const TSCONFIG_FILENAME = 'tsconfig.json'
const TSCONFIG_ESM_FILENAME = 'tsconfig.esm.json'
const PKG_DIRNAME = 'packages'

const projectRoot = path.relative(
  process.cwd(), path.resolve(__dirname, '..'))
const pkgDir = path.join(projectRoot, PKG_DIRNAME)

const projects = fs.readdirSync(pkgDir)
.filter(file => {
  const stat = fs.lstatSync(path.join(pkgDir, file))
  return stat.isDirectory()
})
.map(file => path.join(pkgDir, file, TSCONFIG_FILENAME))
.filter(file => fs.existsSync(file))
.forEach(file => {
  const tsconfig = JSON.parse(fs.readFileSync(file, 'utf8'))
  const references = (tsconfig.references || [])
  .map(ref => ({
    ...ref,
    path: path.join(ref.path, TSCONFIG_ESM_FILENAME),
  }))

  const tsconfigEsm = {
    extends: `./${TSCONFIG_FILENAME}`,
    compilerOptions: {
      "outDir": "esm",
    },
    references,
  }

  const dirname = path.dirname(file)
  const esmFile = path.join(dirname, TSCONFIG_ESM_FILENAME)
  console.log('Writing %s', esmFile)
  fs.writeFileSync(esmFile, JSON.stringify(tsconfigEsm, null, '  '))

  const pkgFile = path.join(dirname, 'package.json')
  const pkg = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
  pkg.module = 'lib/index.js'
  pkg.module = pkg.main ? pkg.main.replace(/^lib/, 'esm') : 'lib/index.js'
  console.log('Writing %s', pkgFile)
  fs.writeFileSync(pkgFile, JSON.stringify(pkg, null, '  '))
})
