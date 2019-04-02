import {TGetAction, TAsyncAction, IAction, PendingAction} from '../actions'
import {IAPIDef, ICredentials, INewUser, IUser} from '@rondo/common'
import {IHTTPClient} from '../http/IHTTPClient'

export type TLoginAction =
  TAsyncAction<IUser, 'LOGIN'>
  | TAsyncAction<unknown, 'LOGIN_LOGOUT'>
  | TAsyncAction<IUser, 'LOGIN_REGISTER'>
  | IAction<{redirectTo: string}, 'LOGIN_REDIRECT_SET'>

type TAction<T extends string> = TGetAction<TLoginAction, T>

export class LoginActions {
  constructor(protected readonly http: IHTTPClient<IAPIDef>) {}

  logIn = (credentials: ICredentials) => {
    return new PendingAction(
      this.http.post('/auth/login', credentials),
      'LOGIN',
    )
  }

  logOut = () => {
    return new PendingAction(
      this.http.get('/auth/logout'),
      'LOGIN_LOGOUT',
    )
  }

  register = (profile: INewUser) => {
    return new PendingAction(
      this.http.post('/auth/register', profile),
      'LOGIN_REGISTER',
    )
  }

  setRedirectTo = (redirectTo: string): TAction<'LOGIN_REDIRECT_SET'> => {
    return {
      payload: {redirectTo},
      type: 'LOGIN_REDIRECT_SET',
    }
  }
}
