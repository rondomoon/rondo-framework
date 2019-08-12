export class Primitives {
  str!: string
  num!: number
  bool!: boolean

  strArray!: string[]
  numArray!: number[]
  boolArray!: boolean[]

  nestedArray!: string[][]
}

export class Name {
  private hidden1?: string
  protected hidden2?: string
  firstName!: string
  lastName!: string
}

export interface IYear {
  yeak: number
}

export interface ITyped<T> {
  value: T
}

type AorB = 'A' | 'B'

export class Person {
  readonly name!: Name
  readonly aliases?: Name[]
  readonly aOrB!: AorB
  readonly inlineAOrB?: 'a' | 'b'
  readonly inlineInterface?: {
    a: number
    b: string
  }
  age?: number
  birthyear: IYear | null = null
  stringAndNumberTuple!: [string, number]
}

export class Employee extends Person {
  duties: string[] = []
}

export class Company {
  personnel1!: Person[]
}

export class Typed<A, B extends 'singleVal', C = 'defVal'> {
  a!: ITyped<A>
  b!: ITyped<B>
  c!: ITyped<C>
  d!: ITyped<A> | ITyped<B>
}
