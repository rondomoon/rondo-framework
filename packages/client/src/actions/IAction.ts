// Maybe this won't be necessary after this is merged:
// https://github.com/Microsoft/TypeScript/pull/29478

export interface IAction<T, ActionType extends string> {
  payload: Promise<T> | T,
  type: ActionType
}
