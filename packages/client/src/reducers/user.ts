import {IUser} from '@rondo/common'
import {UserActionKeys, UserActionType} from '../actions/UserActions'

export interface IUserState {
  error?: string,
  user?: IUser
}

const defaultState: IUserState = {
  error: undefined,
  user: undefined,
}

export function user(state = defaultState, action: UserActionType): IUserState {
  switch (action.type) {
    case UserActionKeys.USER_LOG_IN:
      return {...state, user: action.payload}
    case UserActionKeys.USER_LOG_OUT:
      return {...state, user: undefined}
    case UserActionKeys.USER_LOG_IN_REJECTED:
      return {...state, error: action.error.message}
  }
}
