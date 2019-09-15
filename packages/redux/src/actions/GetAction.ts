import {Action} from './Action'

export type GetAction<ActionTypes, T extends string> =
  ActionTypes extends Action<infer U, T>
  ? ActionTypes
  : never
