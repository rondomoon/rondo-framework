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
    function getAllTypeParameters(type: ts.Type): ts.Type[] {
      console.log('TTT', checker.typeToString(type),
        {
          isObject: !!(type.flags & ts.TypeFlags.Object),
          isTuple: (type as any).objectFlags & ts.ObjectFlags.Tuple,
          objectFlags: (type as any).objectFlags,
        },
      )
      if (type.flags & ts.TypeFlags.Object) {
        const objectType = type as ts.ObjectType
        const objectFlags = objectType.objectFlags
        if (objectFlags & ts.ObjectFlags.Reference) {
          const types = [type]
          const typeRef = type as ts.TypeReference
          if (typeRef.typeArguments) {
            typeRef.typeArguments.forEach(t => {
              const ta = getAllTypeParameters(t)
              types.push(...ta)
            })
          }
          return types
        }
      }

      if (type.isUnionOrIntersection()) {
        // console.log('TTT isUnionOrIntersection')
        const unionOrIntersectionTypes = type.types
        // const types = [type, ...type.types]
        const types: ts.Type[] = [type]
        type.types.forEach(t => {
          const tsp = getAllTypeParameters(t)
          types.push(...tsp)
        })
        return types
      }

      // type.

      if (type.isClassOrInterface()) {
        // console.log('TTT isClassOrInterface')
        if (type.typeParameters) {
          // console.log('TTT typeParameters')
          const types = [type, ...type.typeParameters]
          type.typeParameters.forEach(t => {
            const tsp = getAllTypeParameters(t)
            types.push(...tsp)
          })
          return types
        }
        return [type]
      }

      // if (type.isIntersection()) {
      // }

      // if (type.isTypeParameter()) {
      //   console.log('AAAAAAAAAAAAAAAAAAAAAAAAAAAA')
      // }

      return [type]
    }

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
          console.log('===')
          console.log('text', node.getText(node.getSourceFile()))
          console.log('class', symbol.getName())
          const type = checker.getDeclaredTypeOfSymbol(symbol)

          if (type.isClassOrInterface() && type.typeParameters) {
            type.typeParameters.forEach(tp => {
              console.log('    tp.symbol.name', tp.symbol.name)
              const constraint = tp.getConstraint()
              if (constraint) {
                console.log('    tp.constraint',
                  checker.typeToString(constraint))
              }
              const def = tp.getDefault()
              if (def) {
                console.log('    tp.default', checker.typeToString(def))
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
              const vd = p.valueDeclaration
              const questionToken = ts.isPropertyDeclaration(vd) && !!vd.questionToken

              const propType = checker
              .getTypeOfSymbolAtLocation(p, p.valueDeclaration)

              const s = propType.getSymbol()
              if (s) {
                // if (ts,
                // console.log('   ', p.getName(), checker.getFullyQualifiedName(s))
                // s.value
                // checker.
                // const d = s.getDeclarations()
                // if (d) {
                //   d.forEach(dec => {
                //     console.log('   ', dec.getText())
                //   })
                // }
              }

              p.flags

              console.log('---')
              return {
                name: p.getName(),
                type: checker.typeToString(propType),
                questionToken,
                typeParams: getAllTypeParameters(propType).map(
                  t => checker.typeToString(t)),
                // classOrIface: propType.isClassOrInterface(),
                // union: propType.isUnion(),
              }
          }))
          // output.push(serializeClass(symbol))
        }
        // No need to walk any further, class expressions/inner declarations
        // cannot be exported
      // } else if (ts.isModuleDeclaration(node)) {
      //   // This is a namespace, visit its children
      //   ts.forEachChild(node, visit)
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
