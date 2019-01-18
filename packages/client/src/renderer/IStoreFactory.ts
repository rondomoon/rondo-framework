import {Store} from 'redux'

// TODO maybe Store should also be typed
export type IStoreFactory<T> = (state?: T) => Store
