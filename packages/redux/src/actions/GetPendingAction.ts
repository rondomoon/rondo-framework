import {AsyncAction} from './AsyncAction'

export type GetPendingAction<MyTypes, T extends string> =
  MyTypes extends AsyncAction<infer U, T> & {status: 'pending'}
  ? MyTypes
  : never
