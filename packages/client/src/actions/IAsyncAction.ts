import {IPendingAction} from './IPendingAction'
import {IResolvedAction} from './IResolvedAction'
import {IRejectedAction} from './IRejectedAction'

export type IAsyncStatus = 'pending' | 'resolved' | 'rejected'

export type IAsyncAction<T, ActionType extends string> =
  IPendingAction<T, ActionType>
  | IResolvedAction<T, ActionType>
  | IRejectedAction<ActionType>
