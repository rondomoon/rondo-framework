import * as ts from 'typescript'
import {argparse, arg} from '@rondo.dev/argparse'
import {info, error} from '../log'
import { getFolders } from '../getFolders'
import {readFileSync, writeFileSync} from 'fs'
import {join, resolve, relative} from 'path'
import { findPackageRoot } from '../modules'

interface Package {
  name: string
  version: string
  peerDependencies?: Record<string, string>
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
}

interface TSConfig {
  references?: Array<{path: string}>
}

interface Dependencies {
  dependencies: string[]
  devDependencies: string[]
}

function readJSON<T>(filename: string): T {
  return JSON.parse(readFileSync(filename, 'utf8'))
}

function writeJSON<T>(filename: string, object: T) {
  info('Writing %s', filename)
  writeFileSync(filename, JSON.stringify(object, null, '  '))
}

export function imports(...argv: string[]) {
  const args = argparse({
    packagesDir: arg('string', {default: 'packages/', positional: true}),
    'package': arg('string'),
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

    function getModule(sourceFile: ts.SourceFile, node: ts.Node) {
      if (ts.isImportDeclaration(node)) {
        return node.moduleSpecifier.getText(sourceFile)
      }
      if (ts.isExportDeclaration(node) && node.moduleSpecifier) {
        return node.moduleSpecifier.getText(sourceFile)
      }
    }

    /**
     * Visit nodes finding exported classes
     */
    function visit(sourceFile: ts.SourceFile, node: ts.Node) {
      const moduleWithQuotes = getModule(sourceFile, node)
      if (moduleWithQuotes) {
        const name = moduleWithQuotes.substring(1, moduleWithQuotes.length - 1)
        if (isInstalledModule(name)) {
          debug('  %s', name)
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
        debug(relative(projectDir, sourceFile.fileName))
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

    result.dependencies.sort()
    result.devDependencies.sort()

    return result
  }

  // eslint-disable-next-line
  const rootPackage = readJSON<Package>(args.root)

  function resolveModule(
    packagesDir: string,
    projectDir: string,
    name: string,
    version?: string,
  ) {
    if (!version) {
      throw new Error(`Module "${name}" not found in root package.json`)
    }
    if (version.startsWith('file:')) {
      version = 'file:' + relative(projectDir, version.slice(5))
    }
    // name = name.split('/')[0]
    return {name: name, version}
  }

  function resolveModuleName(name: string) {
    const folders = name.split('/')
    if (folders[0].startsWith('@')) {
      return folders.slice(0, 2).join('/')
    }
    return folders[0]
  }

  function resolveDependencies(
    packagesDir: string,
    dependencies: string[],
    projectDir: string,
  ) {
    return dependencies
    .slice()
    .map(resolveModuleName)
    .sort()
    .reduce((obj, mod) => {
      const versionString =
        (rootPackage.dependencies || {})[mod] ||
        (rootPackage.devDependencies || {})[mod]
      const resolvedModule = resolveModule(
        packagesDir, projectDir, mod, versionString)
      obj[resolvedModule.name] = resolvedModule.version
      return obj
    }, {} as Record<string, string>)
  }

  function organizePackageDependencies(
    packagesDir: string,
    imports: Dependencies,
    projectDir: string,
    packageFile: string,
  ) {
    // handle imports
    const targetPackage = readJSON<Package>(packageFile)
    const dependencies = resolveDependencies(
      packagesDir, imports.dependencies, projectDir)
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
    targetPackage.devDependencies = resolveDependencies(
      packagesDir, imports.devDependencies, projectDir)
    debug('dependencies: %o', targetPackage.dependencies)
    debug('devDependencies: %o', targetPackage.devDependencies)
    return {filename: packageFile, json: targetPackage}
  }

  function organizeProjectReferences(
    packagesDir: string,
    imports: Dependencies,
    projectDir: string,
    tsConfigFileName: string,
  ) {
    const absolutePackagesDir = resolve(process.cwd(), packagesDir)
    const filename = join(projectDir, tsConfigFileName)
    const tsConfig = readJSON<TSConfig>(filename)
    const allDeps = [
      ...imports.dependencies,
      ...imports.devDependencies,
    ]

    tsConfig.references = allDeps
    .map(dep => require.resolve(dep))
    .filter(absoluteDep => absoluteDep.startsWith(absolutePackagesDir))
    .map(findPackageRoot)
    .map(pkgRoot => relative(projectDir, pkgRoot))
    // filter out packages in local node_modules
    .filter(path => !path.startsWith('node_modules'))
    .map(path => ({ path }))

    debug('references: %o', tsConfig.references)

    return {filename, json: tsConfig}
  }

  const folders = args.package
    ? [join(args.packagesDir, args.package)]
    : getFolders(args.packagesDir)

  const result = folders
  .map(pkgDir => {
    error('Entering: %s', pkgDir)
    const tsConfigFileName = 'tsconfig.json'
    const imports = collectImports(pkgDir, tsConfigFileName)
    const packageFile = join(pkgDir, 'package.json')

    return [
      organizePackageDependencies(
        args.packagesDir, imports, pkgDir, packageFile),
      organizeProjectReferences(
        args.packagesDir, imports, pkgDir, tsConfigFileName),
    ]
  })
  .forEach(files => {
    if (!args.dryRun) {
      files.forEach(item => {
        writeJSON(item.filename, item.json)
      })
    }
  })

  return result
}
imports.help = 'Find used module in a package, use root package.json to ' +
  'find dependency versions and update local package.json. Useful when using ' +
  'hoisting in lerna'
