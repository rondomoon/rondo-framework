import {PromiseMiddleware} from '../middleware'
import {
  applyMiddleware,
  createStore as create,
  combineReducers,
  Middleware,
  Action,
  // AnyAction,
  DeepPartial,
  ReducersMapObject,
  // Reducer,
} from 'redux'

export interface ICreateStoreParams<State, A extends Action> {
  reducers: ReducersMapObject<State, A | any>
  state?: DeepPartial<State>
  middleware?: Middleware[]
}

/**
 * Create a Redux store.
 */
export function createStore<State, A extends Action>(
  params: ICreateStoreParams<State, A>,
) {
  const middleware = params.middleware || [new PromiseMiddleware().handle]
  return (state?: DeepPartial<State>) => create(
    combineReducers(params.reducers),
    state,
    applyMiddleware(...middleware),
  )
}
