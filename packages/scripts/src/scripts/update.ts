import * as fs from 'fs'
import * as path from 'path'
import cp from 'child_process'
import {argparse, arg} from '@rondo.dev/argparse'
import {info} from '../log'

export interface IOutdated {
  wanted: string
  latest: string
  location: string
}

export interface IPackage {
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

function findOutdated(cwd: string): Record<string, IOutdated> {
  try {
    const result = cp.execFileSync('npm', ['outdated', '--json'], {
      cwd,
      encoding: 'utf8',
    })
    return result === '' ? {} : JSON.parse(result)
  } catch (err) {
    // npm outdated will exit with code 1 if there are outdated dependencies
    return JSON.parse(err.stdout)
  }
}

export async function update(...argv: string[]) {
  const {parse} = argparse({
    dirs: arg('string[]', {positional: true, default: ['.'], n: '+'}),
    prefix: arg('string', {default: '^'}),
  })
  const {dirs, prefix} = parse(argv)

  let updates = 0
  for (const dir of dirs) {
    info(dir)
    const outdatedByName = findOutdated(dir)

    const pkgFile = path.join(dir, 'package.json')
    const pkg: IPackage = JSON.parse(fs.readFileSync(pkgFile, 'utf8'))
    let pkgUpdate: IPackage = pkg

    // tslint:disable-next-line
    for (const name in outdatedByName) {
      const outdated = outdatedByName[name]
      pkgUpdate = updateDependency(
        pkgUpdate, 'dependencies', name, prefix, outdated)
      pkgUpdate = updateDependency(
        pkgUpdate, 'devDependencies', name, prefix, outdated)
    }

    if (pkgUpdate !== pkg) {
      updates += 1
      info('Writing updates...')
      fs.writeFileSync(pkgFile, JSON.stringify(pkgUpdate, null, '  '))
    }
  }

  if (updates) {
    info('Done! Do not forget to run npm install!')
  }
}

function updateDependency(
  pkg: IPackage,
  key: 'dependencies' | 'devDependencies',
  name: string,
  prefix: string,
  version: IOutdated,
): IPackage {
  const deps = pkg[key]
  if (!deps || !deps[name] || version.wanted === version.latest) {
    return pkg
  }
  info('  %s.%s %s ==> %s', key, name, version.wanted, version.latest)
  return {
    ...pkg,
    [key]: {
      ...deps,
      [name]: prefix + version.latest,
    },
  }
}
