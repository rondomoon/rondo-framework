import { bindActionCreators as bind, Dispatch } from 'redux'

export function bindActionCreators<T extends object>(
  obj: T,
  dispatch: Dispatch,
): T {
  return bind(obj as any, dispatch) // eslint-disable-line
}
