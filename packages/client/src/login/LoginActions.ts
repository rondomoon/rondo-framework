import {GetAction, IAsyncAction, IResolvedAction} from '../actions'
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

export type LoginActionType =
  IAsyncAction<IUser,
    'LOGIN_PENDING',
    'LOGIN_RESOLVED',
    'LOGIN_REJECTED'>
  | IAsyncAction<unknown,
  'LOGIN_LOGOUT_PENDING',
  'LOGIN_LOGOUT_RESOLVED',
  'LOGIN_LOGOUT_REJECTED'>
  | IAsyncAction<IUser,
  'LOGIN_REGISTER_PENDING',
  'LOGIN_REGISTER_RESOLVED',
  'LOGIN_REGISTER_REJECTED'>
  | IResolvedAction<{redirectTo: string}, 'LOGIN_REDIRECT_SET'>

type Action<T extends string> = GetAction<LoginActionType, T>

export class LoginActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  logIn = (credentials: ICredentials): Action<'LOGIN_PENDING'> => {
    return {
      payload: this.http.post('/auth/login', credentials),
      type: 'LOGIN_PENDING',
    }
  }

  logOut = (): Action<'LOGIN_LOGOUT_PENDING'> => {
    return {
      payload: this.http.get('/auth/logout'),
      type: 'LOGIN_LOGOUT_PENDING',
    }
  }

  register = (profile: INewUser): Action<'LOGIN_REGISTER_PENDING'> => {
    return {
      payload: this.http.post('/auth/register', profile),
      type: 'LOGIN_REGISTER_PENDING',
    }
  }

  setRedirectTo = (redirectTo: string): Action<'LOGIN_REDIRECT_SET'> => {
    return {
      payload: {redirectTo},
      type: LoginActionKeys.LOGIN_REDIRECT_SET,
    }
  }
}
