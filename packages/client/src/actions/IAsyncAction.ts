import {IPendingAction} from './IPendingAction'
import {IResolvedAction} from './IResolvedAction'
import {IRejectedAction} from './IRejectedAction'

export type IAsyncAction<T,
  PendingActionType extends string,
  ResolvedActionType extends string,
  RejectedActionType extends string
> =
  IPendingAction<T, PendingActionType>
  | IResolvedAction<T, ResolvedActionType>
  | IRejectedAction<RejectedActionType>
