import {IUser} from '@rondo/common'
import {LoginActionKeys, LoginActionType} from './LoginActions'

export interface ILoginState {
  readonly error?: string,
  readonly user?: IUser
}

const defaultState: ILoginState = {
  error: undefined,
  user: undefined,
}

export function Login(
  state = defaultState,
  action: LoginActionType,
): ILoginState {
  switch (action.type) {
    case LoginActionKeys.USER_LOG_IN:
      return {...state, user: action.payload}
    case LoginActionKeys.USER_LOG_OUT:
      return {...state, user: undefined}
    case LoginActionKeys.USER_LOG_IN_REJECTED:
      return {...state, error: action.error.message}
  }
}
