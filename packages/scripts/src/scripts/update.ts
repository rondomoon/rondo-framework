import * as fs from 'fs'
import * as path from 'path'
import cp from 'child_process'
import {argparse, arg} from '@rondo.dev/argparse'
import {info} from '../log'

export interface Outdated {
  wanted: string
  latest: string
  location: string
}

export interface Package {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function readPackage(dir: string): Package {
  const pkgFile = path.join(dir, 'package.json')
  return JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
}

function writePackage(dir: string, contents: Package) {
  const pkgFile = path.join(dir, 'package.json')
  fs.writeFileSync(pkgFile, JSON.stringify(contents, null, '  '))
}

function findLatestVersions(
  deps: Record<string, string>,
  prefix: string,
): Record<string, string> {
  const latestVersions = Object.keys(deps)
  .filter(depName => !depName.startsWith('@rondo.dev'))
  .reduce((latestVersions, depName) => {
    const version = prefix +
      cp.execFileSync('npm', ['info', depName, 'version']).toString().trim()
    info('  %s (current: %s, latest: %s)', depName, deps[depName], version)
    latestVersions[depName] = version
    return latestVersions
  }, deps)

  return latestVersions
}

export async function update(...argv: string[]) {
  const {parse} = argparse({
    dirs: arg('string[]', {positional: true, default: ['.'], n: '+'}),
    dryRun: arg('boolean', {alias: 'd', default: false}),
    prefix: arg('string', {default: '^'}),
  })
  const {dirs, dryRun, prefix} = parse(argv)

  for (const dir of dirs) {
    info(dir)
    const pkg = readPackage(dir)
    if (pkg.dependencies) {
      pkg.dependencies = findLatestVersions(pkg.dependencies, prefix)
    }
    if (pkg.devDependencies) {
      pkg.devDependencies = findLatestVersions(pkg.devDependencies, prefix)
    }
    if (!dryRun) {
      info('Writing updates...')
      writePackage(dir , pkg)
    }
  }

  info('Done! Do not forget to run npm install!')
}
update.help = 'Update all dependencies to the latest versions'
