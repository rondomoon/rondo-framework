import * as ts from 'typescript'
import * as fs from 'fs'

function isObjectType(type: ts.Type): type is ts.ObjectType {
  return !!(type.flags & ts.TypeFlags.Object)
}

function isTypeReference(type: ts.ObjectType): type is ts.TypeReference {
  return !!(type.objectFlags & ts.ObjectFlags.Reference)
}

function filterInvisibleProperties(type: ts.Symbol): boolean {
  const flags = ts.getCombinedModifierFlags(type.valueDeclaration)
  return !(flags & ts.ModifierFlags.NonPublicAccessibilityModifier)
}

interface IClassProperty {
  name: string
  type: ts.Type
  relevantTypes: ts.Type[]
  typeString: string
  optional: boolean
}

interface IClassDefinition {
  name: string
  typeParameters: ts.TypeParameter[]
  relevantTypeParameters: ts.Type[]
  allRelevantTypes: ts.Type[]
  properties: IClassProperty[]
}

export function typecheck() {
  /** Generate interfaces for all exported classes in a set of .ts files */
  function generateInterfaces(
    fileNames: string[],
    options: ts.CompilerOptions,
  ): void {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(fileNames, options)

    // Get the checker, we will use it to find more about classes
    const checker = program.getTypeChecker()

    const classDefs: IClassDefinition[] = []

    function typeToString(type: ts.Type): string {
      return checker.typeToString(type)
    }

    /**
     * Can be used to filters out global types like Array or string from a list
     * of types. For example: types.filter(filterGlobalTypes)
     */
    function filterGlobalTypes(type: ts.Type): boolean {
      console.log('filterGlobalTypes', typeToString(type))
      const symbol = type.getSymbol()
      if (!symbol) {
        console.log('  no symbol')
        return false
      }
      if (symbol && !((symbol as any).parent)) {
        console.log('  no parent')
        // e.g. Array symbol has no parent
        return false
      }
      if (type.isLiteral()) {
        console.log('  is literal')
        return false
      }
      if (type.isUnionOrIntersection()) {
        console.log('  is union or intersection')
        // union type params should have already been extracted
        return false
      }
      if (isObjectType(type) && isTypeReference(type)) {
        console.log('  is reference')
        if (isObjectType(type.target)
          && type.target.objectFlags & ts.ObjectFlags.Tuple) {
          return false
        }
      }
      // if (isObjectType(type) && type.objectFlags & ts.ObjectFlags.Tuple) {
      //   console.log('  is tuple')
      //   // tuple params should have already been extracted
      //   return false
      // }

      console.log(' ',
        type.flags,
        (type as any).objectFlags,
        !!symbol,
        symbol && !!(symbol as any).parent,
      )
      return true
    }

    /**
     * Converts a generic type to the target of the type reference.
     */
    function mapGenericTypes(type: ts.Type): ts.Type {
      if (isObjectType(type) && isTypeReference(type)) {
        return type.target
      }
      return type
    }

    /**
     * Removes duplicates from an array of types
     */
    function filterDuplicates(type: ts.Type, i: number, arr: ts.Type[]) {
      // TODO improve performance of this method
      return i === arr.indexOf(type)
    }

    /**
     * Recursively retrieves a list of all type parameters.
     */
    function getAllTypeParameters(type: ts.Type): ts.Type[] {
      if (isObjectType(type) && isTypeReference(type)) {
        const types: ts.Type[] = [type]

        if (type.typeArguments) {
          type.typeArguments.forEach(t => {
            const ta = getAllTypeParameters(t)
            types.push(...ta)
          })
        }
        return types
      }

      if (type.isUnionOrIntersection()) {
        const unionOrIntersectionTypes = type.types
        // const types = [type, ...type.types]
        const types: ts.Type[] = [type]
        type.types.forEach(t => {
          const tsp = getAllTypeParameters(t)
          types.push(...tsp)
        })
        return types
      }

      if (type.isClassOrInterface()) {
        if (type.typeParameters) {
          const types = [type, ...type.typeParameters]
          type.typeParameters.forEach(t => {
            const tsp = getAllTypeParameters(t)
            types.push(...tsp)
          })
          return types
        }
        return [type]
      }

      return [type]
    }

    /**
     * True if this is visible outside this file, false otherwise
     */
    function isNodeExported(node: ts.Node): boolean {
      return (
        (ts.getCombinedModifierFlags(node as any) &
          ts.ModifierFlags.Export) !== 0 ||
        (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
      )
    }

    /**
     * Visit nodes finding exported classes
     */
    function visit(node: ts.Node) {
      // Only consider exported nodes
      if (!isNodeExported(node)) {
        return
      }

      if (ts.isClassDeclaration(node) && node.name) {
        // This is a top level class, get its symbol
        const symbol = checker.getSymbolAtLocation(node.name)

        const typeParameters: ts.TypeParameter[] = []
        const expandedTypeParameters: ts.Type[] = []
        const allRelevantTypes: ts.Type[] = []
        if (symbol) {
          // console.log('===')
          // console.log('text', node.getText(node.getSourceFile()))
          // console.log('class', symbol.getName())
          const type = checker.getDeclaredTypeOfSymbol(symbol)

          if (type.isClassOrInterface() && type.typeParameters) {
            type.typeParameters.forEach(tp => {
              // console.log('    tp.symbol.name', tp.symbol.name)
              const constraint = tp.getConstraint()
              if (constraint) {
                expandedTypeParameters.push(...getAllTypeParameters(tp))
              }
              const def = tp.getDefault()
              if (def) {
                expandedTypeParameters.push(...getAllTypeParameters(tp))
              }

              typeParameters.push(tp)
            })
          }

          const properties = type.getApparentProperties()

          const filterClassTypeParameters =
            (t: ts.Type) => typeParameters.every(tp => tp !== t)

          const classProperties: IClassProperty[] = properties
          .filter(filterInvisibleProperties)
          .map(p => {
            const vd = p.valueDeclaration
            const optional = ts.isPropertyDeclaration(vd) && !!vd.questionToken

            const propType = checker.getTypeOfSymbolAtLocation(p, vd)

            const typeParams = getAllTypeParameters(propType)

            const relevantTypes = typeParams
            .filter(filterGlobalTypes)
            .filter(filterClassTypeParameters)
            .map(mapGenericTypes)
            .filter(filterDuplicates)

            allRelevantTypes.push(...relevantTypes)

            return {
              name: p.getName(),
              type: propType,
              relevantTypes,
              typeString: typeToString(type),
              optional,
            }
          })

          const relevantTypeParameters = expandedTypeParameters
          .filter(filterGlobalTypes)
          .filter(mapGenericTypes)
          .filter(filterDuplicates)

          allRelevantTypes.push(...relevantTypeParameters)

          const classDef: IClassDefinition = {
            name: symbol.getName(),
            typeParameters,
            allRelevantTypes: allRelevantTypes
            .filter(filterClassTypeParameters)
            .filter(filterDuplicates),
            relevantTypeParameters,
            properties: classProperties,
          }

          console.log(classDef.name)
          console.log(' ',
            classDef.properties
            .map(p => p.name + ': ' + typeToString(p.type) + '    {' +
              p.relevantTypes.map(typeToString) + '}')
            .join('\n  '),
          )
          console.log('\n  allRelevantTypes:\n   ',
            classDef.allRelevantTypes.map(typeToString).join('\n    '))
          console.log('\n')

          classDefs.push(classDef)
        }
      }
    }

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit)
      }
    }
  }

  const path = __dirname + '/' + 'intergen.sample.ts'
  generateInterfaces([path], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  })
}
