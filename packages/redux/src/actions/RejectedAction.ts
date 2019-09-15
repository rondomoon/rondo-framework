import {Action} from './Action'

export interface RejectedAction<ActionType extends string> extends
  Action<Error, ActionType> {
  status: 'rejected'
}
