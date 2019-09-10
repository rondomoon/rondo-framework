import {IPendingAction, IResolvedAction, IRejectedAction} from '@rondo.dev/redux'

export type ArgumentTypes<T> =
  T extends (...args: infer U) => infer R ? U : never
export type RetType<T> = T extends (...args: any[]) => infer R ? R : never
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T
type RetProm<T> = T extends Promise<any> ? T : Promise<T>
type PromisifyReturnType<T> = (...a: ArgumentTypes<T>) =>
  RetProm<RetType<T>>

/**
 * Helps implement a service from a service definiton that has a context as a
 * last argument.
 */
export type Contextual<T, Cx> = {
  [K in keyof T]:
    T[K] extends (...args: infer A) => infer R
      ? (cx: Cx, ...args: A) => R :
    never
}

export type ReverseContextual<T> = {
  [K in keyof T]:
    T[K] extends (cx: any, ...args: infer A) => infer R
      ? (...args: A) => R :
    never
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: K extends string
    ? T[K] extends (...args: any[]) => any
      ? K
      : never
    : never
}[keyof T]

export type TAsyncified<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export interface IReduxed<ActionType extends string> {
  [key: string]: (...a: any[]) => IRPCPendingAction<any, ActionType, typeof key>
}

export type TReduxed<T, ActionType extends string> = {
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) =>
    IRPCPendingAction<UnwrapPromise<RetType<T[K]>>, ActionType, K>
}

export type TReduxHandlers<T, State> = {
  [K in keyof T]: (
    state: State,
    action: TResolved<TPending<RetType<T[K]>>>,
  ) => Partial<State>
}

export interface IRPCPendingAction<
  T, ActionType extends string, Method extends string | number | symbol
> extends IPendingAction<T, ActionType> {
  method: Method
}

export interface IRPCResolvedAction<
  T, ActionType extends string, Method extends string | symbol | number
> extends IResolvedAction<T, ActionType> {
  method: Method
}

export interface IRPCRejectedAction<
  ActionType extends string, Method extends string | symbol | number
> extends IRejectedAction<ActionType> {
  method: Method
}

export type TRPCAction<
  T, ActionType extends string, Method extends string | number | symbol
> =
  IRPCPendingAction<T, ActionType, Method>
  | IRPCResolvedAction<T, ActionType, Method>
  | IRPCRejectedAction<ActionType, Method>

export type TResolved<A> =
  A extends IRPCPendingAction<infer T, infer ActionType, infer Method>
  ? IRPCResolvedAction<T, ActionType, Method>
  : never

export type TRejected<A> =
  A extends IRPCPendingAction<infer T, infer ActionType, infer Method>
  ? IRPCRejectedAction<ActionType, Method>
  : never

export type TPending<A> =
  A extends IRPCPendingAction<infer T, infer ActionType, infer Method>
  ? IRPCPendingAction<T, ActionType, Method>
  : never

type Values<T> = T[keyof T]
export type TPendingActions<T> = TPending<RetType<Values<T>>>
export type TResolvedActions<T> = TResolved<TPendingActions<T>>
export type TAllActions<T> = TPendingActions<T>
  | TResolvedActions<T> | TRejected<TPendingActions<T>>
