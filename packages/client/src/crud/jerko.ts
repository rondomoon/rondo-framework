export type NonUndefinedPropertyNames<T> = {
  [K in keyof T]: T[K] extends undefined ? never: K
}[keyof T]

export type OnlyRequired<T> = Pick<T, NonUndefinedPropertyNames<T>>

type Args1 = OnlyRequired<{
  query: {a: number, b: string}
  params: {c: number}
}>

type Args2 = OnlyRequired<{
  query: {a: number, b: string}
  params: undefined
}>

type Args3 = OnlyRequired<{
  query: undefined
  params: undefined
}>

const a: Args1 = {
  query: {a: 1, b: 'two'},
  params: {c: 3},
}

const b: Args2 = {
  query: {a: 1, b: 'two'},
}

const c: Args3 = {}
