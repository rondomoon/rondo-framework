// Get the type of promise
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
// section: Type inference in conditional types
type Unpacked<T> = T extends Promise<infer U> ? U : T

type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => any ? {
    payload: Unpacked<ReturnType<T[K]>['payload']>,
    type: Unpacked<ReturnType<T[K]>['type']>,
  }: never
}

export type UnionType<T> = FunctionProperties<T>[keyof FunctionProperties<T>]
