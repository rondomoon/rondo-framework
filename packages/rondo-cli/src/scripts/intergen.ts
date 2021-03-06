import * as fs from 'fs'
import * as ts from 'typescript'
import {argparse, arg} from '@rondo.dev/argparse'
import {error, info} from '../log'

function isObjectType(type: ts.Type): type is ts.ObjectType {
  return !!(type.flags & ts.TypeFlags.Object)
}

function isTypeReference(type: ts.ObjectType): type is ts.TypeReference {
  return !!(type.objectFlags & ts.ObjectFlags.Reference)
}

function isAnonymous(type: ts.Type): boolean {
  return isObjectType(type) && !!(
    type.objectFlags & ts.ObjectFlags.Anonymous)
}

function filterInvisibleProperties(type: ts.Symbol): boolean {
  const flags = ts.getCombinedModifierFlags(type.valueDeclaration)
  return !(flags & ts.ModifierFlags.NonPublicAccessibilityModifier)
}

interface ClassProperty {
  name: string
  type: ts.Type
  relevantTypes: ts.Type[]
  typeString: string
  optional: boolean
}

interface ClassDefinition {
  name: string
  type: ts.Type
  typeParameters: ts.TypeParameter[]
  relevantTypeParameters: ts.Type[]
  allRelevantTypes: ts.Type[]
  properties: ClassProperty[]
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
 *    entities in @rondo.dev/comments-server import and use entities from
 *    @rondo.dev/comments. These types will have to be processed by this module.
 * e) Referenced interfaces should be re-imported in the output file.
 *
 */

export function intergen(...argv: string[]): string {
  const args = argparse({
    input: arg('string', {alias: 'i', required: true}),
    debug: arg('boolean'),
    help: arg('boolean', {alias: 'h'}),
    output: arg('string', {alias: 'o', default: '-'}),
  }, intergen.help).parse(argv)

  function debug(m: string, ...meta: Array<unknown>) {
    if (args.debug) {
      error(m, ...meta)
    }
  }

  /** Generate interfaces for all exported classes in a set of .ts files */
  function classesToInterfaces(
    fileNames: string[],
    options: ts.CompilerOptions,
  ): string[] {
    // Build a program using the set of root file names in fileNames
    const program = ts.createProgram(fileNames, options)

    // Get the checker, we will use it to find more about classes
    const checker = program.getTypeChecker()

    const classDefs: ClassDefinition[] = []

    function typeToString(type: ts.Type): string {
      return checker.typeToString(type)
    }

    /**
     * Can be used to filters out global types like Array or string from a list
     * of types. For example: types.filter(filterGlobalTypes)
     */
    function filterGlobalTypes(type: ts.Type): boolean {
      debug('filterGlobalTypes: %s', typeToString(type))
      if (type.aliasSymbol) {
        // keep type aliases
        return true
      }
      const symbol = type.getSymbol()
      if (!symbol) {
        debug(' no symbol')
        // e.g. string or number types have no symbol
        return false
      }
      if (symbol && symbol.flags & ts.SymbolFlags.Transient) {
        debug(' is transient')
        // Array is transient. not sure if this is the best way to figure this
        return false
      }
      // if (symbol && !((symbol as any).parent)) {
      //   // debug(' no parent', symbol)
      //   // e.g. Array symbol has no parent
      //   return false
      // }
      if (type.isLiteral()) {
        debug(' is literal')
        return false
      }
      if (type.isUnionOrIntersection()) {
        debug(' is u or i')
        return false
      }
      if (isObjectType(type) && isTypeReference(type)) {
        debug(' is object type')
        if (isObjectType(type.target) &&
          type.target.objectFlags & ts.ObjectFlags.Tuple) {
          debug(' is tuple')
          return false
        }
      }

      debug(' keep!')
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
        (ts.getCombinedModifierFlags(node as ts.Declaration) &
          ts.ModifierFlags.Export) !== 0
        // (!!node.parent && node.parent.kind === ts.SyntaxKind.SourceFile)
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

    const typeDefinitions: Map<ts.Type, ClassDefinition> = new Map()
    function handleType(type: ts.Type) {
      if (typeDefinitions.has(type)) {
        return
      }
      if (type.aliasSymbol) {
        throw new Error('Type aliases are not supported')
      }
      const typeParameters: ts.TypeParameter[] = []
      const expandedTypeParameters: ts.Type[] = []
      const allRelevantTypes: ts.Type[] = []

      function handleTypeParameters(typeParams: readonly ts.Type[]) {
        typeParams.forEach(tp => {
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

      if (type.isClassOrInterface() && type.typeParameters) {
        handleTypeParameters(type.typeParameters)
      }

      if (type.aliasSymbol && type.aliasTypeArguments) {
        handleTypeParameters(type.aliasTypeArguments)
      }

      const properties = type.getApparentProperties()

      const filterClassTypeParameters =
        (t: ts.Type) => typeParameters.every(tp => tp !== t)

      const classProperties: ClassProperty[] = properties
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
          typeString: typeToString(propType),
          optional,
        }
      })

      const relevantTypeParameters = expandedTypeParameters
      .filter(filterGlobalTypes)
      .filter(mapGenericTypes)
      .filter(filterDuplicates)

      allRelevantTypes.push(...relevantTypeParameters)

      const classDef: ClassDefinition = {
        name: typeToString(type),
        type,
        // name: symbol.getName(),
        typeParameters,
        allRelevantTypes: allRelevantTypes
        .filter(filterClassTypeParameters)
        .filter(filterDuplicates),
        relevantTypeParameters,
        properties: classProperties,
      }

      if (!isAnonymous(type)) {
        // Prevent defining anonymous declarations as interfaces
        classDefs.push(classDef)
      }
      typeDefinitions.set(type, classDef)

      classDef.allRelevantTypes.forEach(handleType)
    }

    /**
     * Visit nodes finding exported classes
     */
    function visit(node: ts.Node) {
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

    function setTypeName(type: ts.Type, mappings: Map<ts.Type, string>) {
      if (isAnonymous(type)) {
        return
      }
      const name = typeToString(type)
      // (type as any).symbol.name = 'I' + type.symbol.name
      mappings.set(type, `${name}`)
    }

    const nameMappings = new Map<ts.Type, string>()
    for (const classDef of classDefs) {
      setTypeName(classDef.type, nameMappings)
      for (const t of classDef.allRelevantTypes) {
        setTypeName(t, nameMappings)
      }
    }

    function createInterface(classDef: ClassDefinition): string {
      const name = nameMappings.get(classDef.type)!
      const start = `export interface ${name} {`
      const properties = classDef.properties.map(p => {
        const q = p.optional ? '?' : ''
        return `  ${p.name}${q}: ${nameMappings.get(p.type) || p.typeString}`
      })
      .join('\n')
      const end = '}'
      return `${start}\n${properties}\n${end}`
    }

    return classDefs.map(createInterface)
  }

  const interfaces = classesToInterfaces([args.input], {
    target: ts.ScriptTarget.ES5,
    module: ts.ModuleKind.CommonJS,
  })

  const header = '/* This file was generated by rondo intergen script */\n' +
    '/* tslint:disable */\n\n'
  const value = header + interfaces.join('\n\n')
  if (args.output === '-') {
    info(value)
  } else {
    fs.writeFileSync(args.output, value)
  }
  return value
}
intergen.help = 'Generate TypeScript interfaces from all found classes'
