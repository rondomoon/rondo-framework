import {PendingAction} from './PendingAction'
import {ResolvedAction} from './ResolvedAction'
import {RejectedAction} from './RejectedAction'

export type TAsyncStatus = 'pending' | 'resolved' | 'rejected'

export type AsyncAction<T, ActionType extends string> =
  PendingAction<T, ActionType>
  | ResolvedAction<T, ActionType>
  | RejectedAction<ActionType>
