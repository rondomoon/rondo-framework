import {IAsyncAction} from './IAsyncAction'

export type GetPendingAction<MyTypes, T extends string> =
  MyTypes extends IAsyncAction<infer U, T> & {status: 'pending'}
  ? MyTypes
  : never
