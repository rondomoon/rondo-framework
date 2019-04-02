import {IAction} from './IAction'

export type TGetAction<ActionTypes, T extends string> =
  ActionTypes extends IAction<infer U, T>
  ? ActionTypes
  : never
