import { APIDef, Credentials, NewUser, UserProfile } from '@rondo.dev/common'
import { HTTPClient } from '@rondo.dev/http-client'
import { Action, AsyncAction, createPendingAction, TGetAction } from '@rondo.dev/redux'

export type TLoginAction =
  AsyncAction<UserProfile, 'LOGIN'>
  | AsyncAction<unknown, 'LOGIN_LOGOUT'>
  | AsyncAction<UserProfile, 'LOGIN_REGISTER'>
  | Action<{redirectTo: string}, 'LOGIN_REDIRECT_SET'>

type TAction<T extends string> = TGetAction<TLoginAction, T>

export const setRedirectTo = (
  redirectTo: string,
): Action<{redirectTo: string}, 'LOGIN_REDIRECT_SET'> => {
  return {
    payload: {redirectTo},
    type: 'LOGIN_REDIRECT_SET',
  }
}

export class LoginActions {
  constructor(protected readonly http: HTTPClient<APIDef>) {}

  logIn = (credentials: Credentials) => {
    return createPendingAction(
      this.http.post('/auth/login', credentials),
      'LOGIN',
    )
  }

  logOut = () => {
    return createPendingAction(
      this.http.get('/auth/logout'),
      'LOGIN_LOGOUT',
    )
  }

  register = (profile: NewUser) => {
    return createPendingAction(
      this.http.post('/auth/register', profile),
      'LOGIN_REGISTER',
    )
  }

  setRedirectTo = setRedirectTo
}
