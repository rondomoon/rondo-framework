import {IAction} from './IAction'

export type GetAction<MyTypes, T extends string> =
  MyTypes extends IAction<infer U, T>
  ? MyTypes
  : never
