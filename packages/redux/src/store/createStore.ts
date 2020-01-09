import { Action, applyMiddleware, createStore as create, Middleware, PreloadedState, Reducer } from 'redux'
import { PromiseMiddleware, ReduxLogger } from '../middleware'

export interface CreateStoreParams<State, A extends Action> {
  reducer: Reducer<State, A>
  state?: Partial<State>
  middleware?: Middleware[]
  extraMiddleware?: Middleware[]
}

interface A {
  a: number
  b: string
}

/**
 * Create a Redux store.
 */
export function createStore<State, A extends Action>(
  params: CreateStoreParams<State, A>,
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

  return create(
    params.reducer,
    // stupid warning about how Partial<State> | undefined cannot be used as
    // DeepPartial<State> | undefined
    params.state as PreloadedState<State> | undefined,
    applyMiddleware(...middleware),
  )
}
