// Get the type of promise
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
// section: Type inference in conditional types
type Unpacked<T> = T extends Promise<infer U> ? U : T
import {IAction} from './IAction'

// Also from TypeScript handbook:
// https://www.typescriptlang.org/docs/handbook/advanced-types.html
type FunctionProperties<T> = {
  [K in keyof T]: T[K] extends (...args: any[]) => IAction<any, string> ? {
    payload: Unpacked<ReturnType<T[K]>['payload']>,
    type: Unpacked<ReturnType<T[K]>['type']>,
  }: never
}

// https://stackoverflow.com/questions/48305190/
// Is there an automatic way to create a discriminated union for all interfaces
// in a namespace?
export type ActionTypes<T> = FunctionProperties<T>[keyof FunctionProperties<T>]
