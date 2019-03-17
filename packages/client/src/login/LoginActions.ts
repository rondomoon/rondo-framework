import {IAction, IErrorAction, ActionTypes} from '../actions'
import {IAPIDef, ICredentials, IUser} from '@rondo/common'
import {IHTTPClient} from '../http/IHTTPClient'

export enum LoginActionKeys {
  USER_LOG_IN = 'USER_LOG_IN',
  USER_LOG_IN_PENDING = 'USER_LOG_IN_PENDING',
  USER_LOG_IN_REJECTED = 'USER_LOG_IN_REJECTED',

  USER_LOG_OUT = 'USER_LOG_OUT',
  USER_LOG_OUT_PENDING = 'USER_LOG_OUT_PENDING',
  USER_LOG_OUT_REJECTED = 'USER_LOG_OUT_REJECTED',

  REGISTER_USER = 'REGISTER_USER',
  REGISTER_USER_PENDING = 'REGISTER_USER_PENDING',
  REGISTER_USER_REJECTED = 'REGISTER_USER_REJECTED',
}

export class LoginActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  logIn = (credentials: ICredentials)
  : IAction<IUser, LoginActionKeys.USER_LOG_IN> => {
    return {
      payload: this.http.post('/auth/login', credentials),
      type: LoginActionKeys.USER_LOG_IN,
    }
  }

  logInError = (error: Error)
  : IErrorAction<LoginActionKeys.USER_LOG_IN_REJECTED> => {
    return {
      error,
      type: LoginActionKeys.USER_LOG_IN_REJECTED,
    }
  }

  logOut = (): IAction<unknown, LoginActionKeys.USER_LOG_OUT> => {
    return {
      payload: this.http.get('/auth/logout'),
      type: LoginActionKeys.USER_LOG_OUT,
    }
  }

  register = (profile: ICredentials):
  IAction<IUser, LoginActionKeys.REGISTER_USER> => {
    return {
      payload: this.http.post('/auth/register', profile),
      type: LoginActionKeys.REGISTER_USER,
    }
  }

  registerError = (error: Error)
  : IErrorAction<LoginActionKeys.REGISTER_USER_REJECTED> => {
    return {
      error,
      type: LoginActionKeys.REGISTER_USER_REJECTED,
    }
  }
}

// This makes it very easy to write reducer code.
export type LoginActionType = ActionTypes<LoginActions>
