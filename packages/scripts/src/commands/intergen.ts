import * as path from 'path'
import * as ts from 'typescript'
import {readFileSync} from 'fs'

// function processLiteral(type: ts.TypeLiteralNode): string {
//   switch (type
// }

function processTypeArguments(
  typeArguments?: ts.NodeArray<ts.TypeNode>,
): string {
  if (!typeArguments) {
    return ''
  }

  return '<' + typeArguments.map(processTypes).join(', ') + '>'
}

function processTypeParameters(
  typeParameters?: ts.NodeArray<ts.TypeParameterDeclaration>,
): string {
  if (!typeParameters) {
    return ''
  }
  return '<' + typeParameters
  .map(tp => ({
    name: tp.name.text,
    constraint: tp.constraint
      ? processTypes(tp.constraint)
      : undefined,
    default: tp.default
      ? processTypes(tp.default)
      : undefined,
  }))
  .map(tp => {
    if (tp.constraint && tp.default) {
      return `${tp.name} extends ${tp.constraint} = ${tp.default}`
    }
    if (tp.constraint) {
      return `${tp.name} extends ${tp.constraint}`
    }
    if (tp.default) {
      return `${tp.name} = ${tp.default}`
    }
    return tp.name
  })
  .join(', ') + '>'
}

function processLiteral(
  literal: ts.BooleanLiteral | ts.LiteralExpression | ts.PrefixUnaryExpression,
) {
  switch (literal.kind) {
    case ts.SyntaxKind.TrueKeyword:
      return '\'true\''
    case ts.SyntaxKind.FalseKeyword:
      return '\'false\''
    default:
      if (ts.isLiteralExpression(literal)) {
        return `'${literal.text}'`
      }
      throw new Error('Unsupported literal type: ' + literal.kind)
  }
}

function processTypes(type: ts.TypeNode): string {
  switch (type.kind) {
    case ts.SyntaxKind.StringKeyword:
      return 'string'
    case ts.SyntaxKind.BooleanKeyword:
      return 'boolean'
    case ts.SyntaxKind.NumberKeyword:
      return 'number'
    case ts.SyntaxKind.NullKeyword:
      return 'null'
    case ts.SyntaxKind.TrueKeyword:
      return '\'true\''
    case ts.SyntaxKind.FalseKeyword:
      return '\'false\''
    case ts.SyntaxKind.LiteralType:
      const literalType = type as ts.LiteralTypeNode
      return processLiteral(literalType.literal)
      // return literalType.literal.text
    case ts.SyntaxKind.TypeReference:
      const typeRef = type as ts.TypeReferenceNode
      typeRef.typeArguments
      // FIXME do not use any
      return (typeRef.typeName as any).escapedText + processTypeArguments(typeRef.typeArguments)
    case ts.SyntaxKind.TypeLiteral:
      const typeLiteral = type as ts.TypeLiteralNode
      return '{' + processInterfaceMembers(typeLiteral.members).join('\n') + '}'
      // typeLiteral.members.map(processTypes)
      // console.log('aaa', JSON.stringify(typeLiteral, null, '  '))
      // return 'type literal...'
      // console.log('    ', 'type literal...')
      // TODO recursively iterate through typeLiteral.members
      break
    case ts.SyntaxKind.UnionType:
      const unionType = type as ts.UnionTypeNode
      const unionTypes = unionType.types.map(processTypes).join(' | ')
      return unionTypes
    case ts.SyntaxKind.TupleType:
      const tupleTypeNode = type as ts.TupleTypeNode
      const tupleTypes = tupleTypeNode.elementTypes.map(processTypes).join(', ')
      return `[${tupleTypes}]`
      // TODO recursively iterate through tupleTypeNode.elementTypes
      break
    case ts.SyntaxKind.ArrayType:
      const arrayType = type as ts.ArrayTypeNode
      return `Array<${processTypes(arrayType.elementType)}>`
    default:
      throw new Error('unhandled type: ' + type.kind)
  }
}

function processInterfaceMembers(
  members: ts.NodeArray<ts.TypeElement>,
): string[] {
  const results: string[] = []

  for (const m of members) {
    if (m.kind !== ts.SyntaxKind.PropertySignature) {
      throw new Error('not implemented support for node.kind: ' + m.kind)
    }
    const member = m as ts.PropertySignature
    const name = (m.name as ts.Identifier).escapedText

    let result = ''
    let readonly = false
    if (m.modifiers) {
      for (const modifier of m.modifiers) {
        if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) {
          readonly = true
          continue
        }

        console.log('     modifier.kind:', modifier.kind)
      }
    }

    if (readonly) {
      result += 'readonly ' + name
    } else {
      result += name
    }

    if (!member.type) {
      throw new Error('No member type!')
    }

    if (member.questionToken) {
      result += '?: '
    } else {
      result += ': '
    }

    result += processTypes(member.type)
    results.push(result)
  }

  return results
}

function processClassMembers(
  members: ts.NodeArray<ts.ClassElement>,
): string[] {
  const results: string[] = []

  for (const m of members) {
    if (m.kind !== ts.SyntaxKind.PropertyDeclaration) {
      throw new Error('not implemented support for node.kind: ' + m.kind)
    }
    const member = m as ts.PropertyDeclaration
    const name = (m.name as ts.Identifier).escapedText

    let result = ''
    let readonly = false
    let skip = false
    if (m.modifiers) {
      for (const modifier of m.modifiers) {
        if (modifier.kind === ts.SyntaxKind.PrivateKeyword) {
          skip = true
          continue
        }
        if (modifier.kind === ts.SyntaxKind.ProtectedKeyword) {
          skip = true
          continue
        }
        if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) {
          readonly = true
          continue
        }

        console.log('     modifier.kind:', modifier.kind)
      }
    }

    if (skip) {
      continue
    }
    if (readonly) {
      result += 'readonly ' + name
    } else {
      result += name
    }

    if (!member.type) {
      throw new Error('No member type!')
    }

    if (member.questionToken) {
      result += '?: '
    } else {
      result += ': '
    }

    result += processTypes(member.type)
    results.push(result)
  }

  return results
}

function delint(sourceFile: ts.SourceFile) {
  delintNode(sourceFile)

  function delintNode(node: ts.Node) {
    // TODO check which classes are exported
    switch (node.kind) {
      case ts.SyntaxKind.InterfaceDeclaration:
        const interfaceDeclaration = node as ts.InterfaceDeclaration
        let ifaceName = interfaceDeclaration.name.text
        if (interfaceDeclaration.typeParameters) {
          ifaceName += processTypeParameters(interfaceDeclaration.typeParameters)
        }
        console.log(
          ifaceName,
          processInterfaceMembers(interfaceDeclaration.members))
        break
      case ts.SyntaxKind.TypeAliasDeclaration:
        const typeAlias = node as ts.TypeAliasDeclaration
        let taName = typeAlias.name.text
        if (typeAlias.typeParameters) {
          taName += processTypeParameters(typeAlias.typeParameters)
        }
        console.log(taName)
        break
      case ts.SyntaxKind.ClassDeclaration:
        const cls = node as ts.ClassDeclaration
        if (!cls.name) {
          // TODO warn
          throw new Error('no class name: ' + cls.pos)
          break
        }
        let clsName = cls.name.text
        if (cls.typeParameters) {
          clsName += processTypeParameters(cls.typeParameters)
        }
        console.log(clsName, processClassMembers(cls.members))
    }
    ts.forEachChild(node, delintNode)
  }
}

export async function intergen(argv: string[]) {
  const filename = path.join(__dirname, 'intergen.sample.ts')
  const sourceFile = ts.createSourceFile(
    filename,
    readFileSync(filename).toString(),
    ts.ScriptTarget.ES2015,
    false,
  )

  delint(sourceFile)
}
