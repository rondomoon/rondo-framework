import {IAction} from './IAction'

export interface IPendingAction<T, ActionType extends string> extends
  IAction<Promise<T>, ActionType> {
  status: 'pending'
}
