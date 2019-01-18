import {Store} from 'redux'

// TODO maybe Store should also be typed
export type IStoreFactory = (state?: any) => Store
