type ArgumentTypes<T> =
  T extends (...args: infer U) => infer R ? U : never
type RetType<T> = T extends (...args: any[]) => infer R ? R : never
type UnwrapHOC<T> = T extends (...args: any[]) => infer R ? R : T
type RetProm<T> = T extends Promise<any> ? T : Promise<T>
type PromisifyReturnType<T> = (...a: ArgumentTypes<T>) =>
  RetProm<UnwrapHOC<RetType<T>>>

import {IPendingAction, IResolvedAction, IRejectedAction} from '@rondo/client'

export type TAsyncified<T> = {
  [K in keyof T]: PromisifyReturnType<T[K]>
}

export type TReduxed<T, ActionType extends string> = {
  // [K in keyof T]: (...a: ArgumentTypes<T[K]>) => {
  //   type: ActionType
  //   payload: RetProm<UnwrapHOC<RetType<T[K]>>>
  //   method: K
  //   status: 'pending'
  // }
  // [K in keyof T]: (...a: ArgumentTypes<T[K]>) =>
  //   IPendingAction<RetProm<UnwrapHOC<RetType<T[K]>>>, ActionType> & {
  //     method: K,
  //   }
  [K in keyof T]: (...a: ArgumentTypes<T[K]>) =>
    IRPCPendingAction<UnwrapHOC<RetType<T[K]>>, ActionType, K>
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

export type TResolved<A> =
  A extends IRPCPendingAction<infer T, infer ActionType, infer Method>
  ? IRPCResolvedAction<T, ActionType, Method>
  : never

export type TRejected<A> =
  A extends IRPCPendingAction<infer T, infer ActionType, infer Method>
  ? IRPCRejectedAction<ActionType, Method>
  : never

type Values<T> = T[keyof T]
export type TActionCreators<T> = RetType<Values<T>>
export type TAllActions<T> = TActionCreators<T>
  | TResolved<TActionCreators<T>> | TRejected<TActionCreators<T>>
