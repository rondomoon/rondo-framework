import {IAction, IErrorAction, ActionTypes} from '../actions'
import {IAPIDef, ICredentials, INewUser, IUser} from '@rondo/common'
import {IHTTPClient} from '../http/IHTTPClient'

export enum LoginActionKeys {
  LOGIN = 'LOGIN',
  LOGIN_PENDING = 'LOGIN_PENDING',
  LOGIN_REJECTED = 'LOGIN_REJECTED',

  LOGIN_LOG_OUT = 'LOGIN_LOG_OUT',
  LOGIN_LOG_OUT_PENDING = 'LOGIN_LOG_OUT_PENDING',
  LOGIN_LOG_OUT_REJECTED = 'LOGIN_LOG_OUT_REJECTED',

  LOGIN_REGISTER = 'LOGIN_REGISTER',
  LOGIN_REGISTER_PENDING = 'LOGIN_REGISTER_PENDING',
  LOGIN_REGISTER_REJECTED = 'LOGIN_REGISTER_REJECTED',

  LOGIN_REDIRECT_SET = 'LOGIN_REDIRECT_SET',
}

export class LoginActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  logIn = (credentials: ICredentials)
  : IAction<IUser, LoginActionKeys.LOGIN> => {
    return {
      payload: this.http.post('/auth/login', credentials),
      type: LoginActionKeys.LOGIN,
    }
  }

  logInError = (error: Error)
  : IErrorAction<LoginActionKeys.LOGIN_REJECTED> => {
    return {
      error,
      type: LoginActionKeys.LOGIN_REJECTED,
    }
  }

  logOut = (): IAction<unknown, LoginActionKeys.LOGIN_LOG_OUT> => {
    return {
      payload: this.http.get('/auth/logout'),
      type: LoginActionKeys.LOGIN_LOG_OUT,
    }
  }

  register = (profile: INewUser):
  IAction<IUser, LoginActionKeys.LOGIN_REGISTER> => {
    return {
      payload: this.http.post('/auth/register', profile),
      type: LoginActionKeys.LOGIN_REGISTER,
    }
  }

  registerError = (error: Error)
  : IErrorAction<LoginActionKeys.LOGIN_REGISTER_REJECTED> => {
    return {
      error,
      type: LoginActionKeys.LOGIN_REGISTER_REJECTED,
    }
  }

  setRedirectTo = (redirectTo: string)
  : IAction<{redirectTo: string}, LoginActionKeys.LOGIN_REDIRECT_SET> => {
    return {
      payload: {redirectTo},
      type: LoginActionKeys.LOGIN_REDIRECT_SET,
    }
  }
}

// This makes it very easy to write reducer code.
export type LoginActionType = ActionTypes<LoginActions>
