import * as fs from 'fs'
import { platform } from 'os'
import * as path from 'path'

export function getPathSeparator(platformValue: string) {
  return platformValue === 'win32' ? ';' : ':'
}

export function findNodeModules(dir: string = process.cwd()): string[] {
  let lastPath = ''
  const paths = []
  dir = path.resolve(dir)
  while (dir !== lastPath) {
    const nodeModulesDir = path.join(dir, 'node_modules', '.bin')
    if (
      fs.existsSync(nodeModulesDir)
      && fs.statSync(nodeModulesDir).isDirectory()
    ) {
      paths.push(nodeModulesDir)
    }
    lastPath = dir
    dir = path.resolve(dir, '..')
  }
  return paths
}

export function findPackageRoot(dir: string): string {
  let currentDir = dir
  let lastDir = dir
  do {
    let s: fs.Stats
    try {
      s = fs.statSync(path.join(currentDir, 'package.json'))
    } catch (err) {
      lastDir = currentDir
      currentDir = path.resolve(currentDir, '..')
      continue
    }
    if (!s.isFile()) {
      lastDir = currentDir
      currentDir = path.resolve(currentDir, '..')
      continue
    }
    return currentDir
  } while (lastDir !== currentDir)

  throw new Error(`No package.json for directory "${dir}"`)
}

export function getPathVariable(
  pathsToAdd: string[] = findNodeModules(),
  currentPath = process.env.PATH,
) {
  if (!pathsToAdd.length) {
    return currentPath
  }
  const separator = getPathSeparator(platform())
  return `${pathsToAdd.join(separator)}${separator}${currentPath}`
}
