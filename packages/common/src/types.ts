/**
 * transform unknown into undefined
 */
export type Optional<T> = T extends {} ? T : undefined

export type NonUndefinedPropertyNames<T> = {
  [K in keyof T]: T[K] extends undefined ? never: K
}[keyof T]

export type OnlyRequired<T> = Pick<T, NonUndefinedPropertyNames<T>>

export type NonUnknownPropertyNames<T> = {
  [K in keyof T]: T[K] extends {} ? K : never
}[keyof T]

export type OnlyDefined<T> = Pick<T, NonUnknownPropertyNames<T>>

/**
 * Remove types from T that are not assignable to U
 * https://www.typescriptlang.org/docs/handbook/advanced-types.html
 */
export type Filter<T, U> = T extends U ? T : never
