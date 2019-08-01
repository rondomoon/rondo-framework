import * as fs from 'fs'
import * as path from 'path'
import {platform} from 'os'

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
