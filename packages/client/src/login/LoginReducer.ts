import {IUser} from '@rondo/common'
import {LoginActionType} from './LoginActions'

export interface ILoginState {
  readonly error?: string
  readonly user?: IUser
  readonly redirectTo: string
}

const defaultState: ILoginState = {
  error: undefined,
  user: undefined,
  redirectTo: '/',
}

export function Login(
  state = defaultState,
  action: LoginActionType,
): ILoginState {
  switch (action.type) {
    case 'LOGIN_RESOLVED':
      return {...state, user: action.payload, error: ''}
    case 'LOGIN_LOGOUT_RESOLVED':
      return {...state, user: undefined}
    case 'LOGIN_REJECTED':
      return {...state, error: action.error.message}
    case 'LOGIN_REGISTER_RESOLVED':
      return {...state, user: action.payload, error: ''}
    case 'LOGIN_REGISTER_REJECTED':
      return {...state, error: action.error.message}
    case 'LOGIN_REDIRECT_SET':
      return {...state, redirectTo: action.payload.redirectTo}
    default:
      return state
  }
}
