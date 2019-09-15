import { Stats, statSync } from 'fs'
import { join, resolve } from 'path'

function findNearestDirectory(
  dir: string, filename: string,
) {
  let currentDir = dir
  let lastDir = dir
  do {
    let s: Stats
    try {
      s = statSync(join(currentDir, filename))
    } catch (err) {
      lastDir = currentDir
      currentDir = resolve(currentDir, '..')
      continue
    }
    if (!s.isFile()) {
      lastDir = currentDir
      currentDir = resolve(currentDir, '..')
      continue
    }

    return currentDir
  } while (lastDir !== currentDir)
}

export function findPackageRoot(dir: string = __dirname) {
  return findNearestDirectory(dir, 'package.json')
}
