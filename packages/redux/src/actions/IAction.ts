export interface IAction<T, ActionType extends string> {
  payload: T
  type: ActionType
}
