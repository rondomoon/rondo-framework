import {AsyncAction} from './AsyncAction'

export type GetResolvedAction<MyTypes, T extends string> =
  MyTypes extends AsyncAction<infer U, T> & {status: 'resolved'}
  ? MyTypes
  : never
