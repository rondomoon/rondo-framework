import {PendingAction} from './PendingAction'

export function createPendingAction<T, ActionType extends string>(
  payload: Promise<T>,
  type: ActionType,
): PendingAction<T, ActionType> {
  return {payload, type, status: 'pending'}
}
