import {TAsyncAction} from './TAsyncAction'

export type TGetPendingAction<MyTypes, T extends string> =
  MyTypes extends TAsyncAction<infer U, T> & {status: 'pending'}
  ? MyTypes
  : never
