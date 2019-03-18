import {IUser} from '@rondo/common'
import {LoginActionKeys, LoginActionType} from './LoginActions'

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
    case LoginActionKeys.LOGIN:
      return {...state, user: action.payload, error: ''}
    case LoginActionKeys.LOGIN_LOG_OUT:
      return {...state, user: undefined}
    case LoginActionKeys.LOGIN_REJECTED:
      return {...state, error: action.error.message}
    case LoginActionKeys.LOGIN_REGISTER:
      return {...state, user: action.payload, error: ''}
    case LoginActionKeys.LOGIN_REGISTER_REJECTED:
      return {...state, error: action.error.message}
    case LoginActionKeys.LOGIN_REDIRECT_SET:
      return {...state, redirectTo: action.payload.redirectTo}
    default:
      return state
  }
}
