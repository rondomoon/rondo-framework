import {createStore as create} from 'redux'
import {value, IState} from './reducers'

export function createStore(state?: IState) {
  return create(value, state)
}
