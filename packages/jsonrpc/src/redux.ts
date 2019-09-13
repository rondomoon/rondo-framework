import {
  IRPCActions,
  RPCClient,
  RPCActions,
  TResolvedActions,
  TAllActions,
  RPCReduxHandlers,
} from './types'

export function createActions<T, ActionType extends string>(
  client: RPCClient<T>,
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

  return service as RPCActions<T, ActionType>
}

export interface IState {
  loading: number
  error: string
}

export function createReducer<ActionType extends string, State extends IState>(
  actionType: ActionType,
  defaultState: State,
) {

  const self = {
    withHandler<R extends IRPCActions<ActionType>>(
      handleAction: (state: State, action: TResolvedActions<R>) => State,
    ): (state: State | undefined, action: TAllActions<R>) => State {
      return (state: State = defaultState, action: TAllActions<R>): State => {
        if (action.type !== actionType) {
          return state
        }
        if (action.status === 'pending') {
          return {
            ...state,
            loading: state.loading + 1,
            error: '',
          }
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
    },
    withMapping<R extends IRPCActions<ActionType>>(
      handlers: RPCReduxHandlers<R, State>,
    ) {
      return self.withHandler<R>((state, action) => {
        if (action.method in handlers) {
          const newState = handlers[action.method](state, action)
          return {
            ...state,
            ...newState,
          }
        }
        return state
      })
    },
  }

  return self
}
