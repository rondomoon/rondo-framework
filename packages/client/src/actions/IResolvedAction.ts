import {IAction} from './IAction'

export interface IResolvedAction<T, ActionType extends string> extends
  IAction<T, ActionType> {
  payload: T
  status: 'resolved'
}
