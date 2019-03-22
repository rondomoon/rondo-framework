import {IAction} from './IAction'

export interface IRejectedAction<ActionType extends string> extends
  IAction<ActionType> {
  error: Error
}
