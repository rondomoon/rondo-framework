import {PromiseMiddleware} from './middleware'
import {applyMiddleware, createStore as create} from 'redux'
import {reducers, IState} from './reducers'

export function createStore(state?: IState) {
  return create(
    reducers,
    state,
    applyMiddleware(
      new PromiseMiddleware().handle,
    ),
  )
}
