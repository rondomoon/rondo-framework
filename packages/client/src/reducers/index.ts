export * from './user'

import {combineReducers} from 'redux'
import * as user from './user'

export const reducers = combineReducers(user)
export type IState = ReturnType<typeof reducers>
