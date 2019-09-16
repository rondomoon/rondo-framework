import {UserProfile} from '@rondo.dev/common'
import {LoginAction} from './LoginActions'

export interface LoginState {
  readonly error: string
  readonly isLoading: boolean
  readonly user?: UserProfile
  readonly redirectTo: string
}

const defaultState: LoginState = {
  error: '',
  isLoading: false,
  user: undefined,
  redirectTo: '/',
}

export function Login(
  state = defaultState,
  action: LoginAction,
): LoginState {
  switch (action.type) {
    // sync actions
    case 'LOGIN_REDIRECT_SET':
      return {...state, redirectTo: action.payload.redirectTo}
    case 'LOGIN':
    case 'LOGIN_LOGOUT':
    case 'LOGIN_REGISTER':
      // async actions
      switch (action.status) {
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
  }
  return state
}
