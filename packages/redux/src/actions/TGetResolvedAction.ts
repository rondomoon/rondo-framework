import {TAsyncAction} from './TAsyncAction'

export type TGetResolvedAction<MyTypes, T extends string> =
  MyTypes extends TAsyncAction<infer U, T> & {status: 'resolved'}
  ? MyTypes
  : never
