import * as fs from 'fs'
import * as ts from 'typescript'
import {argparse, arg} from '../argparse'

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

/*
 * TODO
 *
 * Interfaces generated from exported class delcarations will be prefixed with
 * "I". A few cases need to be differentiated:
 *
 * a) Private (non-exported) types / interfaces / classes defined and used in
 *    same module. In case of non-exported classes, an error can be thrown.
 *    These can be copied and perhaps indexed to prevent collisions.
 * b) Referenced exported classes from the same file
 * c) Referenced exported classes from a neighbouring file
 * d) Referenced imported classes from external modules. Real world example:
 *    entities in @rondo/comments-server import and use entities from
 *    @rondo/comments. These types will have to be processed by this module.
 * e) Referenced interfaces should be re-imported in the output file.
 *
 */

export function typecheck(...argv: string[]) {
  const args = argparse({
    file: arg('string', {
      default: __dirname + '/' + 'intergen.sample.ts',
      alias: 'f',
    }),
    debug: arg('boolean'),
    help: arg('boolean', {alias: 'h'}),
  }).parse(argv)

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
      // console.log('fgt', typeToString(type))
      if (type.aliasSymbol) {
        // keep type aliases
        return true
      }
      const symbol = type.getSymbol()
      if (!symbol) {
        // console.log(' no symbol')
        // e.g. string or number types have no symbol
        return false
      }
      if (symbol && !((symbol as any).parent)) {
        // console.log(' no parent')
        // e.g. Array symbol has no parent
        return false
      }
      if (type.isLiteral()) {
        // console.log(' is literal')
        return false
      }
      if (type.isUnionOrIntersection()) {
        // console.log(' is u or i')
        return false
      }
      if (isObjectType(type) && isTypeReference(type)) {
        // console.log(' is object type')
        if (isObjectType(type.target) &&
          type.target.objectFlags & ts.ObjectFlags.Tuple) {
          // console.log(' is tuple')
          return false
        }
      }

      // console.log(' keep!')
      return true
    }

    /**
     * Converts a generic type to the target of the type reference.
     */
    function mapGenericTypes(type: ts.Type): ts.Type {
      if (type.aliasSymbol) {
        return checker.getDeclaredTypeOfSymbol(type.aliasSymbol)
      }
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
      function collectTypeParams(
        type2: ts.Type, params?: readonly ts.Type[],
      ): ts.Type[] {
        const types: ts.Type[] = [type2]
        if (params) {
          params.forEach(t => {
            const atp = getAllTypeParameters(t)
            types.push(...atp)
          })
        }
        return types
      }

      if (type.aliasSymbol) {
        return collectTypeParams(type, type.aliasTypeArguments)
      }
      if (isObjectType(type) && isTypeReference(type)) {
        return collectTypeParams(type, type.typeArguments)
      }

      if (type.isUnionOrIntersection()) {
        return collectTypeParams(type, type.types)
      }

      if (type.isClassOrInterface()) {
        return collectTypeParams(type, type.typeParameters)
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

    function handleClassDeclaration(node: ts.ClassDeclaration) {
      if (!node.name) {
        return
      }
      // This is a top level class, get its symbol
      const symbol = checker.getSymbolAtLocation(node.name)
      if (!symbol) {
        return
      }

      const type = checker.getDeclaredTypeOfSymbol(symbol)
      handleType(type)
    }

    function handleType(type: ts.Type) {
      const typeParameters: ts.TypeParameter[] = []
      const expandedTypeParameters: ts.Type[] = []
      const allRelevantTypes: ts.Type[] = []

      if (type.isClassOrInterface() && type.typeParameters) {
        type.typeParameters.forEach(tp => {
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
        name: typeToString(type),
        // name: symbol.getName(),
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

    /**
     * Visit nodes finding exported classes
     */
    function visit(node: ts.Node) {
      // console.log('node.getText()', node.getText())
      // console.log('node.kind', node.kind)

      if (ts.isExportDeclaration(node)) {
        if (node.exportClause) {
          // console.log('export {...} from', node.exportClause.elements.length)
        } else {
          // console.log('export * from...')
          // it is exporting *
        }
      }

      // Only consider exported nodes
      if (!isNodeExported(node)) {
        return
      }

      if (ts.isClassDeclaration(node)) {
        handleClassDeclaration(node)
      }
    }

    // Visit every sourceFile in the program
    for (const sourceFile of program.getSourceFiles()) {
      if (!sourceFile.isDeclarationFile) {
        // Walk the tree to search for classes
        ts.forEachChild(sourceFile, visit)
      }
    }

    const Vote = classDefs.find(c => c.name === 'Vote')
    if (Vote) {
      console.log('found vote')
      const U = Vote.allRelevantTypes.find(t => typeToString(t) === 'User')
      if (U) {
        console.log('found user')
        handleType(U)
      }
    }
  }

  generateInterfaces([args.file], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  })
}
