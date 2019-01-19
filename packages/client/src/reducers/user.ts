import {IUser} from '@rondo/common'
import {UserActionKeys, UserActionType} from '../actions/UserActions'

interface IState {
  user?: IUser
}

const defaultState: IState = {
  user: undefined,
}

export function user(state = defaultState, action: UserActionType): IState {
  switch (action.type) {
    case UserActionKeys.USER_LOG_IN:
      return {user: action.payload}
    case UserActionKeys.USER_LOG_OUT:
      return {user: undefined}
  }
}
