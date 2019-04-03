import {ReduxLogger, PromiseMiddleware} from '../middleware'
import {
  applyMiddleware,
  createStore as create,
  Middleware,
  Action,
  DeepPartial,
  Reducer,
} from 'redux'

export interface ICreateStoreParams<State, A extends Action> {
  reducer: Reducer<State, A>
  state?: DeepPartial<State>
  middleware?: Middleware[]
}

/**
 * Create a Redux store.
 */
export function createStore<State, A extends Action>(
  params: ICreateStoreParams<State, A>,
) {
  const middleware = params.middleware || [
    new ReduxLogger().handle,
    new PromiseMiddleware().handle,
  ]
  return (state?: DeepPartial<State>) => create(
    params.reducer,
    state,
    applyMiddleware(...middleware),
  )
}
