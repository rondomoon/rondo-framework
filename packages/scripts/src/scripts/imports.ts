import * as ts from 'typescript'
import {argparse, arg} from '@rondo.dev/argparse'
import {info, error} from '../log'
import { getFolders } from '../getFolders'

export function imports(...argv: string[]): string[] {
  const args = argparse({
    packages: arg('string', {default: 'packages/', positional: true}),
    root: arg('string', {default: 'package.json'}),
    debug: arg('boolean'),
    help: arg('boolean', {alias: 'h'}),
    output: arg('string', {alias: 'o', default: '-'}),
  }).parse(argv)

  function debug(m: string, ...meta: Array<unknown>) {
    if (args.debug) {
      info(m, ...meta)
    }
  }

  /** Generate interfaces for all exported classes in a set of .ts files */
  function collectImports(
    projectDir: string,
    tsconfigFileName: string,
  ): string[] {
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
    const configFile = ts.readConfigFile(configPath, ts.sys.readFile);
    const parsedCommandLine = ts.parseJsonConfigFileContent(
      configFile.config,
      parseConfigHost,
      projectDir,
    );

    const program = ts.createProgram(
      parsedCommandLine.fileNames,
      parsedCommandLine.options,
    )

    const modules = new Set<string>()

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

          if (!modules.has(name)) {
            debug(name)
            modules.add(name)
          }

        }

        ts.forEachChild(node, visit.bind(null, sourceFile))
      }
    }

    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        ts.forEachChild(sourceFile, visit.bind(null, sourceFile))
      }
    }

    return Array.from(modules)
  }

  getFolders(args.packages)
  .forEach(pkgDir => {
    error('Entering: %s', pkgDir)
    const modules = collectImports(pkgDir, 'tsconfig.json')
  })

  if (args.output === '-') {
    // info(value)
  } else {
    // fs.writeFileSync(args.output, value)
  }

  return []
}
