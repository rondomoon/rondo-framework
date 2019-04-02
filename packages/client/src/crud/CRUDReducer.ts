import {IAction, IResolvedAction} from '../actions'
import {ICRUDAction} from './ICRUDAction'
import {ICRUDMethod} from './ICRUDMethod'
import {indexBy, without} from '@rondo/common'

type Filter<T, U> = T extends U ? T : never

export interface ICRUDEntity {
  readonly id: number
}

export interface ICRUDMethodStatus {
  readonly isLoading: boolean
  readonly error: string
}

export interface ICRUDState<T extends ICRUDEntity> {
  readonly ids: ReadonlyArray<number>
  readonly byId: Record<number, T>
  status: ICRUDStatus
}

export interface ICRUDStatus {
  readonly save: ICRUDMethodStatus
  readonly update: ICRUDMethodStatus
  readonly remove: ICRUDMethodStatus
  readonly findOne: ICRUDMethodStatus
  readonly findMany: ICRUDMethodStatus
}

export class CRUDReducer<
  T extends ICRUDEntity,
  ActionType extends string,
> {
  readonly defaultState: ICRUDState<T>

  constructor(readonly actionName: ActionType) {

    const defaultMethodStatus = this.getDefaultMethodStatus()
    this.defaultState = {
      ids: [],
      byId: {},

      status: {
        save: defaultMethodStatus,
        update: defaultMethodStatus,
        remove: defaultMethodStatus,
        findOne: defaultMethodStatus,
        findMany: defaultMethodStatus,
      },
    }
  }

  getDefaultMethodStatus(): ICRUDMethodStatus {
    return {
      error: '',
      isLoading: false,
    }
  }

  protected getSuccessStatus(): ICRUDMethodStatus {
    return {
      isLoading: false,
      error: '',
    }
  }

  handleRejected = (
    state: ICRUDState<T>,
    action: Filter<ICRUDAction<T, ActionType>, {status: 'rejected'}>,
  ): ICRUDState<T> => {
    return {
      ...state,
      status: {
        ...state.status,
        [action.method]: {
          isLoading: false,
          error: action.payload.message,
        },
      },
    }
  }

  handleLoading = (
    state: ICRUDState<T>,
    action: Filter<ICRUDAction<T, ActionType>, {status: 'pending'}>,
  ): ICRUDState<T> => {
    return {
      ...state,
      status: {
        ...state.status,
        [action.method]: {
          isLoading: true,
          error: '',
        },
      },
    }
  }

  handleFindOne = (
    state: ICRUDState<T>,
    action: Filter<
      ICRUDAction<T, ActionType>, {method: 'findOne', status: 'resolved'}>,
  ): ICRUDState<T> => {
    const {payload} = action
    return {
      ...state,
      ids: [...state.ids, payload.id],
      byId: {
        [payload.id]: payload,
      },
      status: {
        ...state.status,
        [action.method]: this.getSuccessStatus(),
      },
    }
  }

  handleSave = (
    state: ICRUDState<T>,
    action: Filter<
      ICRUDAction<T, ActionType>, {method: 'save', status: 'resolved'}>,
  ): ICRUDState<T> => {
    const {payload} = action
    return {
       ...state,
       ids: [...state.ids, payload.id],
       byId: {
         [payload.id]: payload,
       },
       status: {
         ...state.status,
          [action.method]: this.getSuccessStatus(),
       },
     }
  }

  handleUpdate = (
    state: ICRUDState<T>,
    action: Filter<
      ICRUDAction<T, ActionType>, {method: 'update', status: 'resolved'}>,
  ): ICRUDState<T> => {
    const {payload} = action
    return {
      ...state,
      byId: {
        [payload.id]: payload,
      },
      status: {
        ...state.status,
         [action.method]: this.getSuccessStatus(),
      },
    }
  }

  handleRemove = (
    state: ICRUDState<T>,
    action: Filter<
      ICRUDAction<T, ActionType>, {method: 'remove', status: 'resolved'}>,
  ): ICRUDState<T> => {
    const {payload} = action
    return {
      ...state,
      ids: state.ids.filter(id => id !== payload.id),
      byId: without(state.byId, payload.id),
      status: {
        ...state.status,
        [action.method]: this.getSuccessStatus(),
      },
    }
  }

  handleFindMany = (
    state: ICRUDState<T>,
    action: Filter<
      ICRUDAction<T, ActionType>, {method: 'findMany', status: 'resolved'}>,
  ): ICRUDState<T> => {
    const {payload} = action
    return {
      ...state,
      ids: payload.map(item => item.id),
      byId: indexBy(payload, 'id' as any),
      status: {
        ...state.status,
        [action.method]: this.getSuccessStatus(),
      },
    }
  }

  reduce = (
    state: ICRUDState<T> | undefined,
    action: ICRUDAction<T, ActionType>,
  ): ICRUDState<T> => {
    const {defaultState} = this
    state = state || defaultState

    if (action.type !== this.actionName) {
      return state
    }

    switch (action.status) {
      case 'pending':
           return this.handleLoading(state, action)
      case 'rejected':
           return this.handleRejected(state, action)
      case 'resolved':
        switch (action.method) {
          case 'save':
            return this.handleSave(state, action)
          case 'update':
            return this.handleUpdate(state, action)
          case 'remove':
            return this.handleRemove(state, action)
          case 'findOne':
            return this.handleFindOne(state, action)
          case 'findMany':
            return this.handleFindMany(state, action)
        }
      default:
        return state
    }
  }
}
