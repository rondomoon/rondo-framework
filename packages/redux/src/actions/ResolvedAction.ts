import {Action} from './Action'

export interface ResolvedAction<T, ActionType extends string> extends
  Action<T, ActionType> {
  payload: T
  status: 'resolved'
}
