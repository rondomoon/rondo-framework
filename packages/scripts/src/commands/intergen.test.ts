jest.mock('../log')

import {intergen} from './intergen'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'

describe('intergen', () => {

  const tmpdir = os.tmpdir()
  const templateName = 'intergen.tmp'

  let sourceFiles: string[] = []
  let i = 0
  function createSourceFile(contents: string) {
    i++
    const sourceFile = path.join(tmpdir, templateName + i + '.ts')
    fs.writeFileSync(sourceFile, contents)
    sourceFiles.push(sourceFile)
    return sourceFile
  }

  function execute(source: string): string {
    const file = createSourceFile(source)
    return intergen('intergen', '-i', file)
  }

  afterEach(() => {
    sourceFiles.forEach(f => fs.unlinkSync(f))
    sourceFiles = []
  })

  it('converts exported class into interface', () => {
    const result = execute(`export class Value {
  amount: number
}`)
    expect(result).toEqual(`export interface Value {
  amount: number
}`)
  })

  it('does nothing when class is not exported', () => {
    const result = execute(`class Value {
  amount: number
}`)
    expect(result).toEqual(``)
  })

  it('converts inherited classes into interfaces', () => {
    const result = execute(`class A {
  a: number
}
export class B extends A {
  b: string
}`)
    expect(result).toEqual(`export interface B {
  b: string
  a: number
}`)
  })

  it('converts referenced classes into interfaces', () => {
    const result = execute(`class A {
  a: number
}
export class B {
  a: A
}`)
    expect(result).toEqual(`export interface B {
  a: A
}

export interface A {
  a: number
}`)
  })

  it('correctly converts union properties', () => {
    const result = execute(`export class A {
  a: 'b' | 'c'
}`)
    expect(result).toEqual(`export interface A {
  a: "b" | "c"
}`)
  })

  it('correctly converts array properties', () => {
    const result = execute(`class Name {
  firstName: string
}

export class Names {
  names1: Name[]
  names2: Array<Name>
  names3: Name[][]
  names4: Array<Array<Name>>
`)
    expect(result).toEqual(`export interface Names {
  names1: Name[]
  names2: Name[]
  names3: Name[][]
  names4: Name[][]
}

export interface Name {
  firstName: string
}`)
  })

  it('correctly converts intersections', () => {
    const result = execute(`export class C {
  c: A & B
}

class A {
  a: string
}

class B {
  b: number
}`)
    expect(result).toEqual(`export interface C {
  c: A & B
}

export interface A {
  a: string
}

export interface B {
  b: number
}`)
  })

  it('correctly converts inline property definitions', () => {
    const result = execute(`export class A {
  b: {a: string, c: number}
}`)
    expect(result).toEqual(`export interface A {
  b: { a: string; c: number; }
}`)
  })

  it('correctly converts inline defs w/ references', () => {
    const result = execute(`class A {
  a: number
}
export class B {
  b: { a: A; c: number; }
}`)
    expect(result).toEqual(`export interface B {
  b: { a: A; c: number; }
}

export interface A {
  a: number
}`)
  })

})
