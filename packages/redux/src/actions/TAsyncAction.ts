import {IPendingAction} from './IPendingAction'
import {IResolvedAction} from './IResolvedAction'
import {IRejectedAction} from './IRejectedAction'

export type TAsyncStatus = 'pending' | 'resolved' | 'rejected'

export type TAsyncAction<T, ActionType extends string> =
  IPendingAction<T, ActionType>
  | IResolvedAction<T, ActionType>
  | IRejectedAction<ActionType>
