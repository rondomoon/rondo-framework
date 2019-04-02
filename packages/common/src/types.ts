/**
 * transform unknown into undefined
 */
export type TOptional<T> = T extends {} ? T : undefined

export type TNonUndefinedPropertyNames<T> = {
  [K in keyof T]: T[K] extends undefined ? never: K
}[keyof T]

export type TOnlyRequired<T> = Pick<T, TNonUndefinedPropertyNames<T>>

export type TNonUnknownPropertyNames<T> = {
  [K in keyof T]: T[K] extends {} ? K : never
}[keyof T]

export type TOnlyDefined<T> = Pick<T, TNonUnknownPropertyNames<T>>

/**
 * Remove types from T that are not assignable to U
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export type TFilter<T, U> = T extends U ? T : never

export type TReadonlyRecord<K extends string | number | symbol, V> =
  Readonly<Record<K, V>>
