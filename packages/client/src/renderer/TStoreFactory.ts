import {Action, Store} from 'redux'

// TODO maybe Store should also be typed
export type TStoreFactory<State, A extends Action> =
  (state?: State) => Store<State, A | any>
