import {
  IReduxed,
  TAsyncified,
  TReduxed,
  TResolvedActions,
  TAllActions,
} from './types'
import {createRemoteClient} from './remote'

export function createReduxClient<T, ActionType extends string>(
  client: TAsyncified<T>,
  type: ActionType,
) {
  const service = Object.keys(client).reduce((obj, method: any) => {
    obj[method] = function makeAction(...args: any[]) {
      const payload = ((client as any)[method])(...args)
      return {
        payload,
        type,
        method,
        status: 'pending',
      }
    }
    return obj
  }, {} as any)

  return service as TReduxed<T, ActionType>
}

export const createReducer = <ActionType extends string, State>(
  actionType: ActionType,
  defaultState: State,
) => <R extends IReduxed<ActionType>>(
  handleAction: (state: State, action: TResolvedActions<R>) => State,
) => (state: State = defaultState, action?: TAllActions<R>): State => {
  if (!action) {
    return state
  }
  if (action.type !== actionType) {
    return state
  }
  if (action.status === 'pending') {
    // TODO handle loading
    return state
  }
  if (action.status === 'rejected') {
    // TODO handle rejected
    return state
  }
  return handleAction(state, action)
}
