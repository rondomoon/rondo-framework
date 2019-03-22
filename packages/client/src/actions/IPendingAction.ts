import {IAction} from './IAction'

export interface IPendingAction<T, ActionType extends string> extends
  IAction<ActionType> {
  payload: Promise<T>
}
