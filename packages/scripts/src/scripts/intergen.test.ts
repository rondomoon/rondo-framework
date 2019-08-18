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
    const module = templateName + i
    const fullPath = path.join(tmpdir, module + '.ts')
    fs.writeFileSync(fullPath, contents)
    sourceFiles.push(fullPath)
    return {fullPath, module}
  }

  function start(input: string) {
    return intergen('intergen', '-i', input)
  }

  function execute(source: string): string {
    const {fullPath} = createSourceFile(source)
    return start(fullPath)
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

  it('generates interfaces from related source files', () => {
    const {module: f1} = createSourceFile(`export class A {
  a: number
}`)
    const {module: f2} = createSourceFile(`import {A} from './${f1}'
export class B {
  a: A
}`)
    const {fullPath} =
      createSourceFile(`export * from './${f2}'`)
    const result = start(fullPath)
    expect(result).toEqual(`export interface A {
  a: number
}

export interface B {
  a: A
}`)
  })

})
