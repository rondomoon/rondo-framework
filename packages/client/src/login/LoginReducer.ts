import {IUser} from '@rondo/common'
import {LoginActionType} from './LoginActions'

export interface ILoginState {
  readonly error: string
  readonly isLoading: boolean
  readonly user?: IUser
  readonly redirectTo: string
}

const defaultState: ILoginState = {
  error: '',
  isLoading: false,
  user: undefined,
  redirectTo: '/',
}

export function Login(
  state = defaultState,
  action: LoginActionType,
): ILoginState {
  switch (action.type) {
    // sync actions
    case 'LOGIN_REDIRECT_SET':
      return {...state, redirectTo: action.payload.redirectTo}
    default:
      // async actions
      switch (action.status) {
        // FIXME this will trigger for all async actions with status pending
        case 'pending':
          return {
            ...state,
            isLoading: true,
          }
        case 'rejected':
          return {
            ...state,
            isLoading: false,
            error: action.payload.message,
          }
        case 'resolved':
          switch (action.type) {
            case 'LOGIN':
              return {...state, user: action.payload, error: ''}
            case 'LOGIN_LOGOUT':
              return {...state, user: undefined}
            case 'LOGIN_REGISTER':
              return {...state, user: action.payload, error: ''}
          }
      }
      return state
  }
}
