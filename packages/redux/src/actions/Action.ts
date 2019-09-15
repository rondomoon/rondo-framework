export interface Action<T, ActionType extends string> {
  payload: T
  type: ActionType
}
