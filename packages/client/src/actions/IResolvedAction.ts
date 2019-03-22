import {IAction} from './IAction'

export interface IResolvedAction<T, ActionType extends string> extends
  IAction<ActionType> {
  payload: T
}
