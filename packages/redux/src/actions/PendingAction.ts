import {IPendingAction} from './IPendingAction'

export class PendingAction<T, ActionType extends string> {
  readonly status = 'pending'
  constructor(
    readonly payload: T,
    readonly type: ActionType,
  ) {}
}
