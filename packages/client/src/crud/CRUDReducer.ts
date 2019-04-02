import {IAction, IResolvedAction} from '../actions'
import {TCRUDAction} from './TCRUDAction'
import {TCRUDMethod} from './TCRUDMethod'
import {indexBy, without, TFilter} from '@rondo/common'

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
    method: TCRUDMethod,
    error: Error,
  ): ICRUDState<T> => {
    return {
      ...state,
      status: {
        ...state.status,
        [method]: {
          isLoading: false,
          error: error.message,
        },
      },
    }
  }

  handleLoading = (
    state: ICRUDState<T>,
    method: TCRUDMethod,
  ): ICRUDState<T> => {
    return {
      ...state,
      status: {
        ...state.status,
        [method]: {
          isLoading: true,
          error: '',
        },
      },
    }
  }

  handleFindOne = (state: ICRUDState<T>, payload: T): ICRUDState<T> => {
    return {
      ...state,
      ids: [...state.ids, payload.id],
      byId: {
        [payload.id]: payload,
      },
      status: {
        ...state.status,
        findOne: this.getSuccessStatus(),
      },
    }
  }

  handleSave = (state: ICRUDState<T>, payload: T): ICRUDState<T> => {
    return {
       ...state,
       ids: [...state.ids, payload.id],
       byId: {
         [payload.id]: payload,
       },
       status: {
         ...state.status,
         save: this.getSuccessStatus(),
       },
     }
  }

  handleUpdate = (state: ICRUDState<T>, payload: T): ICRUDState<T> => {
    return {
      ...state,
      byId: {
        [payload.id]: payload,
      },
      status: {
        ...state.status,
        update: this.getSuccessStatus(),
      },
    }
  }

  handleRemove = (state: ICRUDState<T>, payload: T): ICRUDState<T> => {
    return {
      ...state,
      ids: state.ids.filter(id => id !== payload.id),
      byId: without(state.byId, payload.id),
      status: {
        ...state.status,
        remove: this.getSuccessStatus(),
      },
    }
  }

  handleFindMany = (state: ICRUDState<T>, payload: T[]): ICRUDState<T> => {
    return {
      ...state,
      ids: payload.map(item => item.id),
      byId: indexBy(payload, 'id' as any),
      status: {
        ...state.status,
        findMany: this.getSuccessStatus(),
      },
    }
  }

  reduce = (
    state: ICRUDState<T> | undefined,
    action: TCRUDAction<T, ActionType>,
  ): ICRUDState<T> => {
    const {defaultState} = this
    state = state || defaultState

    if (action.type !== this.actionName) {
      return state
    }

    switch (action.status) {
      case 'pending':
           return this.handleLoading(state, action.method)
      case 'rejected':
           return this.handleRejected(state, action.method, action.payload)
      case 'resolved':
        switch (action.method) {
          case 'save':
            return this.handleSave(state, action.payload)
          case 'update':
            return this.handleUpdate(state, action.payload)
          case 'remove':
            return this.handleRemove(state, action.payload)
          case 'findOne':
            return this.handleFindOne(state, action.payload)
          case 'findMany':
            return this.handleFindMany(state, action.payload)
        }
      default:
        return state
    }
  }
}
