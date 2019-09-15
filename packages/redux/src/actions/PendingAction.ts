import {Action} from './Action'

export interface PendingAction<T, ActionType extends string> extends
  Action<Promise<T>, ActionType> {
  status: 'pending'
}
