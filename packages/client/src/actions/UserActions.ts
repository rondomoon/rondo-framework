import {ActionTypes} from './ActionTypes'
import {IAPIDef, ICredentials, IUser} from '@rondo/common'
import {IHTTPClient} from '../http/IHTTPClient'

export enum UserActionKeys {
  USER_LOG_IN = 'USER_LOG_IN',
  USER_LOG_IN_FULFILLED = 'USER_LOG_IN_FULFILLED',
  USER_LOG_IN_REJECTED = 'USER_LOG_IN_REJECTED',

  USER_LOG_OUT = 'USER_LOG_OUT',
  USER_LOG_OUT_FULFILLED = 'USER_LOG_OUT_FULFILLED',
  USER_LOG_OUT_REJECTED = 'USER_LOG_OUT_REJECTED',
}

interface IAction<PayloadType, ActionType> {
  payload: Promise<PayloadType> | PayloadType,
  type: ActionType
}

export class UserActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  logIn(credentials: ICredentials): IAction<IUser, UserActionKeys.USER_LOG_IN> {
    return {
      payload: this.http.post('/auth/login', credentials),
      type: UserActionKeys.USER_LOG_IN,
    }
  }

  logOut(): IAction<unknown, UserActionKeys.USER_LOG_OUT> {
    return {
      payload: this.http.get('/auth/logout'),
      type: UserActionKeys.USER_LOG_OUT,
    }
  }
}

// This makes it very easy to write reducer code.
export type UserActionType = ActionTypes<UserActions>
