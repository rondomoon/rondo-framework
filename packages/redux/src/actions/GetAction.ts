import {Action} from './Action'

export type TGetAction<ActionTypes, T extends string> =
  ActionTypes extends Action<infer U, T>
  ? ActionTypes
  : never
