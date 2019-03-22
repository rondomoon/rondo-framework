import {IAction} from './IAction'

export type GetAction<MyTypes, T extends string> =
  MyTypes extends IAction<T>
  ? MyTypes
  : never
