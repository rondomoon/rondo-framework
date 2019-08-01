type ArgumentTypes<T> =
  T extends (...args: infer U) => infer R ? U : never
type RetType<T> = T extends (...args: any[]) => infer R ? R : never
type UnwrapHOC<T> = T extends (...args: any[]) => infer R ? R : T
type UnwrapPromise<T> = T extends Promise<infer V> ? V : T
type RetProm<T> = T extends Promise<any> ? T : Promise<T>
type PromisifyReturnType<T> = (...a: ArgumentTypes<T>) =>
  RetProm<UnwrapHOC<RetType<T>>>

import {IPendingAction, IResolvedAction, IRejectedAction} from '@rondo/client'

export type TAsyncified<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export interface IReduxed<ActionType extends string> {
  [key: string]: (...a: any[]) => IRPCPendingAction<any, ActionType, typeof key>
}

export type TReduxed<T, ActionType extends string> = {
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) =>
    IRPCPendingAction<UnwrapPromise<UnwrapHOC<RetType<T[K]>>>, ActionType, K>
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
