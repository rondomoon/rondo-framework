import * as path from 'path'
import * as ts from 'typescript'
import {readFileSync} from 'fs'

function delint(sourceFile: ts.SourceFile) {
  delintNode(sourceFile)

  function delintNode(node: ts.Node) {
    // TODO check which classes are exported
    // TODO check which interfaces are in use
    // TODO check which type references are in use in addition to the
    //      primitives like string, string[], number, number[], boolean,
    //      boolean[]
    switch (node.kind) {
      case ts.SyntaxKind.ClassDeclaration:
        const cls = node as ts.ClassDeclaration
        if (!cls.name) {
          // TODO warn
          console.log('no class name', cls.pos)
          break
        }
        console.log(cls.name.escapedText)
        for (const m of cls.members) {
          if (m.kind !== ts.SyntaxKind.PropertyDeclaration) {
            console.log('not implemented support for node.kind:', m.kind)
            break
          }
          const member = m as ts.PropertyDeclaration
          const name = m.name as ts.Identifier
          console.log('  ', name.escapedText)
          if (m.modifiers) {
            for (const modifier of m.modifiers) {
              if (modifier.kind === ts.SyntaxKind.ReadonlyKeyword) {
                console.log('    ', 'readonly')
              } else {
                console.log('     modifier.kind:', modifier.kind)
              }
            }
          }
          if (!member.type) {
            console.log('no member type!')
            break
          }
          // console.log('     member:', JSON.stringify(member, null, '  '))
          console.log('     questionToken:', !!member.questionToken)
          switch (member.type.kind) {
            case ts.SyntaxKind.StringKeyword:
              console.log('     string')
              break
            case ts.SyntaxKind.BooleanKeyword:
              console.log('     boolean')
              break
            case ts.SyntaxKind.NumberKeyword:
              console.log('     number')
              break
            case ts.SyntaxKind.TypeReference:
              const typeRef = member.type as ts.TypeReferenceNode
              console.log('    ', (typeRef.typeName as any).escapedText)
              break
            case ts.SyntaxKind.TypeLiteral:
              console.log('    ', 'type literal...')
              break
            case ts.SyntaxKind.UnionType:
              console.log('    ', 'union type...')
              break
            case ts.SyntaxKind.TupleType:
              console.log('    ', 'tuple type...')
              break
            case ts.SyntaxKind.ArrayType:
              const arrayType = member.type as ts.ArrayTypeNode
              switch (arrayType.elementType.kind) {
                case ts.SyntaxKind.StringKeyword:
                  console.log('     Array<string>')
                  break
                case ts.SyntaxKind.BooleanKeyword:
                  console.log('     Array<boolean>')
                  break
                case ts.SyntaxKind.NumberKeyword:
                  console.log('     Array<number>')
                  break
                case ts.SyntaxKind.TypeReference:
                  const typeRef = arrayType.elementType as ts.TypeReferenceNode
                  console.log(`     Array<${(typeRef.typeName as any).escapedText}>`)
                default:
                  console.log('WARN unhandled array type:', arrayType.elementType.kind)
              }
              break
            default:
              console.log('unhandled type:', member.type.kind)
          }
        }
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
