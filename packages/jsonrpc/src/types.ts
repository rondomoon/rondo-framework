import {PendingAction, ResolvedAction, RejectedAction} from '@rondo.dev/redux'

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
export type WithContext<T, Cx> = {
  [K in keyof T]:
    T[K] extends (...args: infer A) => infer R
      ? (cx: Cx, ...args: A) => R :
    never
}

export type WithoutContext<T> = {
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

export type RPCClient<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export interface RPCActionsRecord<ActionType extends string> {
  [key: string]: (...a: any[]) => RPCPendingAction<any, ActionType, typeof key>
}

export type RPCActions<T, ActionType extends string> = {
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) =>
    RPCPendingAction<UnwrapPromise<RetType<T[K]>>, ActionType, K>
}

export type RPCReduxHandlers<T, State> = {
  [K in keyof T]: (
    state: State,
    action: GetResolvedAction<GetPendingAction<RetType<T[K]>>>,
  ) => Partial<State>
}

export interface RPCPendingAction<
  T, ActionType extends string, Method extends string | number | symbol
> extends PendingAction<T, ActionType> {
  method: Method
}

export interface RPCResolvedAction<
  T, ActionType extends string, Method extends string | symbol | number
> extends ResolvedAction<T, ActionType> {
  method: Method
}

export interface RPCRejectedAction<
  ActionType extends string, Method extends string | symbol | number
> extends RejectedAction<ActionType> {
  method: Method
}

export type RPCAction<
  T, ActionType extends string, Method extends string | number | symbol
> =
  RPCPendingAction<T, ActionType, Method>
  | RPCResolvedAction<T, ActionType, Method>
  | RPCRejectedAction<ActionType, Method>

export type GetResolvedAction<A> =
  A extends RPCPendingAction<infer T, infer ActionType, infer Method>
  ? RPCResolvedAction<T, ActionType, Method>
  : never

export type GetRejectedAction<A> =
  A extends RPCPendingAction<infer T, infer ActionType, infer Method>
  ? RPCRejectedAction<ActionType, Method>
  : never

export type GetPendingAction<A> =
  A extends RPCPendingAction<infer T, infer ActionType, infer Method>
  ? RPCPendingAction<T, ActionType, Method>
  : never

type Values<T> = T[keyof T]
export type PendingActions<T> = GetPendingAction<RetType<Values<T>>>
export type ResolvedActions<T> = GetResolvedAction<PendingActions<T>>
export type AllActions<T> = PendingActions<T>
  | ResolvedActions<T> | GetRejectedAction<PendingActions<T>>
