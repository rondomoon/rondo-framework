import {ReduxLogger, PromiseMiddleware, WaitMiddleware} from '../middleware'
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
  state?: Partial<State>
  middleware?: Middleware[]
  extraMiddleware?: Middleware[]
}

/**
 * Create a Redux store.
 */
export function createStore<State, A extends Action>(
  params: ICreateStoreParams<State, A>,
) {
  const middleware = params.middleware || [
    new ReduxLogger(
      typeof window !== 'undefined'
      && typeof window.localStorage !== 'undefined'
      && typeof window.localStorage.log !== 'undefined',
    ).handle,
    new PromiseMiddleware().handle,
  ]
  if (params.extraMiddleware) {
    middleware.push(...params.extraMiddleware)
  }
  return (state?: DeepPartial<State>) => create(
    params.reducer,
    state,
    applyMiddleware(...middleware),
  )
}
