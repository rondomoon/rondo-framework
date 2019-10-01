import * as ts from 'typescript'
import {argparse, arg} from '@rondo.dev/argparse'
import {info, error} from '../log'
import { getFolders } from '../getFolders'
import {readFileSync} from 'fs'
import {join} from 'path'

interface Package {
  name: string
  version: string
  peerDependencies?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface Dependencies {
  dependencies: string[]
  devDependencies: string[]
}

export function imports(...argv: string[]) {
  const args = argparse({
    packages: arg('string', {default: 'packages/', positional: true}),
    root: arg('string', {default: './package.json'}),
    dryRun: arg('boolean'),
    testFileRegex: arg('string', {default: '\\.test\\.(t|j)sx?$'}),
    debug: arg('boolean'),
    help: arg('boolean', {alias: 'h'}),
    output: arg('string', {alias: 'o', default: '-'}),
  }).parse(argv)

  const testFileRegex = new RegExp(args.testFileRegex)

  function debug(m: string, ...meta: Array<unknown>) {
    if (args.debug) {
      info(m, ...meta)
    }
  }

  /** Generate interfaces for all exported classes in a set of .ts files */
  function collectImports(
    projectDir: string,
    tsconfigFileName: string,
  ): Dependencies {
    // Build a program using the set of root file names in fileNames
    // const program = ts.createProgram(fileNames, options)
    const configPath = ts.findConfigFile(
      projectDir,
      ts.sys.fileExists,
      tsconfigFileName,
    )
    if (!configPath) {
      throw new Error('No tsconfig.json found')
    }

    const parseConfigHost: ts.ParseConfigHost = {
      fileExists: ts.sys.fileExists,
      readFile: ts.sys.readFile,
      readDirectory: ts.sys.readDirectory,
      useCaseSensitiveFileNames: true,
    }
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile)
    const parsedCommandLine = ts.parseJsonConfigFileContent(
      configFile.config,
      parseConfigHost,
      projectDir,
    )

    const program = ts.createProgram(
      parsedCommandLine.fileNames,
      parsedCommandLine.options,
    )

    // key is dependency name, list contains source files
    const filenamesByRequiredModule: Record<string, string[]> = {}

    // Get the checker, we will use it to find more about classes
    // const checker = program.getTypeChecker()

    function isInstalledModule(moduleName: string) {
      return !moduleName.startsWith('.')
    }

    /**
     * Visit nodes finding exported classes
     */
    function visit(sourceFile: ts.SourceFile, node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        const text = node.moduleSpecifier.getText(sourceFile)
        const name = text.substring(1, text.length - 1)
        if (isInstalledModule(name)) {
          let resolved: string
          try {
            resolved = require.resolve(name)
          } catch (err) {
            error('Warning require.resolve: %s', err.message)
            return
          }

          if (resolved === name) {
            // Names of modules provided by NodeJS like "fs" will be the same
            return
          }

          const filenames = filenamesByRequiredModule[name] =
            filenamesByRequiredModule[name] || []
          filenames.push(sourceFile.fileName)
        }

        ts.forEachChild(node, visit.bind(null, sourceFile))
      }
    }

    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        ts.forEachChild(sourceFile, visit.bind(null, sourceFile))
      }
    }

    const result: Dependencies = {
      dependencies: [],
      devDependencies: [],
    }
    Object.keys(filenamesByRequiredModule).forEach(moduleName => {
      const filenames = filenamesByRequiredModule[moduleName]
      if (filenames.every(filename => testFileRegex.test(filename))) {
        result.devDependencies.push(moduleName)
      } else {
        result.dependencies.push(moduleName)
      }
    })

    return result
  }

  function readPackage(path: string): Package {
    return JSON.parse(readFileSync(path, 'utf8'))
  }

  // eslint-disable-next-line
  const rootPackage = readPackage(args.root)

  function resolveModule(name: string, version?: string) {
    if (!version) {
      throw new Error(`Module "${name}" not found in root package.json`)
    }
    if (version.startsWith('file:')) {
      const pkg = readPackage(join(version.slice(5), 'package.json'))
      if (!pkg.version) {
        throw new Error(`Package.json of referenced module "${name}" ` +
          'does not have version field')
      }
      return {name, version: pkg.version}
    }
    name = name.split('/')[0]
    return {name: name, version}
  }

  function resolveModuleName(name: string) {
    const folders = name.split('/')
    if (folders[0].startsWith('@')) {
      return folders.slice(0, 2).join('/')
    }
    return folders[0]
  }

  function resolveDependencies(dependencies: string[]) {
    return dependencies
    .map(resolveModuleName)
    .reduce((obj, mod) => {
      const versionString =
        (rootPackage.dependencies || {})[mod] ||
        (rootPackage.devDependencies || {})[mod]
      const resolvedModule = resolveModule(mod, versionString)
      obj[resolvedModule.name] = resolvedModule.version
      return obj
    }, {} as Record<string, string>)
  }

  const result = getFolders(args.packages)
  .map(pkgDir => {
    error('Entering: %s', pkgDir)
    const imports = collectImports(pkgDir, 'tsconfig.json')
    const packageFile = join(pkgDir, 'package.json')
    const targetPackage = readPackage(packageFile)
    const dependencies = resolveDependencies(imports.dependencies)
    if (targetPackage.peerDependencies) {
      const peerDependencyNames = new Set(
        Object.keys(targetPackage.peerDependencies),
      )
      const depsWithoutPeers = Object
      .keys(dependencies)
      .reduce((obj, dep) => {
        if (!peerDependencyNames.has(dep)) {
          obj[dep] = dependencies[dep]
        } else {
          error('Skipping peer dependency "%s"', dep)
        }
        return obj
      }, {} as Record<string, string>)
      targetPackage.dependencies = depsWithoutPeers
    } else {
      targetPackage.dependencies = dependencies
    }
    targetPackage.devDependencies = resolveDependencies(imports.devDependencies)
    debug('dependencies: %o', targetPackage.dependencies)
    debug('devDependencies: %o', targetPackage.devDependencies)
    return {filename: packageFile, json: targetPackage}
  })
  .forEach(pkg => {
    // TODO write package.json
    // const value = JSON.stringify(pkg.json, null, '  ')
    // fs.writeFileSync(pkg.filename, value)
  })

  return result
}
imports.help = 'Find used module in a package, use root package.json to ' +
  'find dependency versions and update local package.json. Useful when using ' +
  'hoisting in lerna'
