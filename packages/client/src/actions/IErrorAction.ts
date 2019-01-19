export interface IErrorAction<ActionType extends string> {
  error: Error,
  type: ActionType
}
