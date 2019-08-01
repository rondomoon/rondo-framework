import {
  IReduxed,
  TAsyncified,
  TReduxed,
  TResolvedActions,
  TAllActions,
  TReduxHandlers,
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

export interface IState {
  loading: number
  error: string
}

export const createReducer = <ActionType extends string, State extends IState>(
  actionType: ActionType,
  defaultState: State,
) => <R extends IReduxed<ActionType>>(
  handleAction: (state: State, action: TResolvedActions<R>) => State,
) => (state: State = defaultState, action: TAllActions<R>): State => {
  if (action.type !== actionType) {
    return state
  }
  if (action.status === 'pending') {
    return {
      ...state,
      loading: state.loading + 1,
      error: '',
    }
    return state
  }
  if (action.status === 'rejected') {
    return {
      ...state,
      loading: state.loading - 1,
      error: action.payload.message,
    }
  }
  return handleAction({
    ...state,
    loading: state.loading - 1,
    error: '',
  }, action)
}

export const createReducer2 = <ActionType extends string, State extends IState>(
  actionType: ActionType,
  defaultState: State,
) => <R extends IReduxed<ActionType>>(
  handlers: TReduxHandlers<R, State>,
) => {
  return createReducer(actionType, defaultState)<R>((state, action) => {
    if (action.method in handlers) {
      const newState = handlers[action.method](state, action)
      return {
        ...state,
        newState,
      }
    }
    return state
  })
}
