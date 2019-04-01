import {IAsyncAction} from './IAsyncAction'

export type GetResolvedAction<MyTypes, T extends string> =
  MyTypes extends IAsyncAction<infer U, T> & {status: 'resolved'}
  ? MyTypes
  : never
