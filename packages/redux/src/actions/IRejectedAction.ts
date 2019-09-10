import {IAction} from './IAction'

export interface IRejectedAction<ActionType extends string> extends
  IAction<Error, ActionType> {
  status: 'rejected'
}
