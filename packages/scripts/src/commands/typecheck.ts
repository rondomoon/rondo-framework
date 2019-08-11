import * as ts from 'typescript'
import * as fs from 'fs'

export function typecheck() {
  interface DocEntry {
    name?: string
    fileName?: string
    documentation?: string
    type?: string
    constructors?: DocEntry[]
    parameters?: DocEntry[]
    returnType?: string
  }

  /** Generate documentation for all classes in a set of .ts files */
  function generateDocumentation(
    fileNames: string[],
    options: ts.CompilerOptions,
  ): void {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(fileNames, options)

    // Get the checker, we will use it to find more about classes
    const checker = program.getTypeChecker()

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit)
      }
    }

    return

    /** visit nodes finding exported classes */
    function visit(node: ts.Node) {
      // Only consider exported nodes
      if (!isNodeExported(node)) {
        return
      }

      if (ts.isClassDeclaration(node) && node.name) {
        // This is a top level class, get its symbol
        const symbol = checker.getSymbolAtLocation(node.name)
        if (symbol) {
          console.log('class', symbol.getName())

          // console.log('symbolToString', checker.symbolToString(symbol))

          // const tpd = checker.symbolToTypeParameterDeclarations(symbol)
          // if (tpd) {
          //   console.log('  type params: %o', tpd.map(t => {
          //     ts.getCombinedModifierFlags(t.symbol.valueDeclaration)
          //     return {
          //       name: t.name.text,
          //       constraint: !!t.constraint,
          //       default: !!t.default,
          //       // constraint: !!t.constraint
          //       //   ? checker.getTypeFromTypeNode(t.constraint)
          //       //   : undefined,
          //     }
          //   }))
          // }

          const type = checker.getDeclaredTypeOfSymbol(symbol)

          if (type.isClassOrInterface() && type.typeParameters) {
            type.typeParameters.forEach(tp => {
              console.log('tp.symbol.name', tp.symbol.name)
              const constraint = tp.getConstraint()
              if (constraint) {
                console.log('tp.constraint', checker.typeToString(constraint))
              }
              const def = tp.getDefault()
              if (def) {
                console.log('tp.default', checker.typeToString(def))
              }
            })
          }

          // const properties = checker.getPropertiesOfType(type)
          const properties = type.getApparentProperties()

          console.log('  %o', properties
            .filter(p => {
              const flags = ts.getCombinedModifierFlags(p.valueDeclaration)
              // return s.parent && s.parent.flags & 32 /* Class */
              // ? flags
              // : flags & ~28 /* AccessibilityModifier */;
              return !(flags & ts.ModifierFlags.NonPublicAccessibilityModifier)
            })
            .map(p => {
              const propType = checker
              .getTypeOfSymbolAtLocation(p, p.valueDeclaration!)

              return {
                name: p.getName(),
                type: checker.typeToString(propType),
                classOrIface: propType.isClassOrInterface(),
              }
          }))
          // output.push(serializeClass(symbol))
        }
        // No need to walk any further, class expressions/inner declarations
        // cannot be exported
      } else if (ts.isModuleDeclaration(node)) {
        // This is a namespace, visit its children
        ts.forEachChild(node, visit)
      }
    }

    /** True if this is visible outside this file, false otherwise */
    function isNodeExported(node: ts.Node): boolean {
      return (
        (ts.getCombinedModifierFlags(node as any) &
          ts.ModifierFlags.Export) !== 0 ||
        (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
      )
    }
  }

  const path = __dirname + '/' + 'intergen.sample.ts'
  generateDocumentation([path], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  })
}
