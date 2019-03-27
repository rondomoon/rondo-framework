import {IAction} from '../actions'
import {indexBy, without} from '@rondo/common'

export type ICRUDMethod =
  'put' | 'post' | 'delete' | 'get' | 'getMany'

export interface ICRUDIdable {
  readonly id: number
}

export interface ICRUDMethodStatus {
  readonly isLoading: boolean
  readonly error: string
}

export interface ICRUDState<T extends ICRUDIdable> {
  readonly ids: ReadonlyArray<number>
  readonly byId: Record<number, T>
  status: ICRUDStatus
}

export interface ICRUDStatus {
    readonly post: ICRUDMethodStatus
    readonly put: ICRUDMethodStatus
    readonly delete: ICRUDMethodStatus
    readonly get: ICRUDMethodStatus
    readonly getMany: ICRUDMethodStatus
}

export interface ICRUDActions {
  readonly post: string
  readonly put: string
  readonly delete: string
  readonly get: string
  readonly getMany: string
}

export interface ICRUDAction<P, T extends string = string> extends IAction<T> {
  payload: P,
}

export class CRUDReducer<T extends ICRUDIdable> {
  readonly defaultState: ICRUDState<T>
  readonly actionTypes: ReturnType<CRUDReducer<T>['getActionTypes']>

  constructor(
    readonly actions: ICRUDActions,
    readonly pendingExtension = '_PENDING',
    readonly resolvedExtension = '_RESOLVED',
    readonly rejectedExtension = '_REJECTED',
  ) {
    this.defaultState = {
      ids: [],
      byId: {},

      status: {
        post: {
          error: '',
          isLoading: false,
        },
        put: {
          error: '',
          isLoading: false,
        },
        delete: {
          error: '',
          isLoading: false,
        },
        get: {
          error: '',
          isLoading: false,
        },
        getMany: {
          error: '',
          isLoading: false,
        },
      },
    }

    this.actionTypes = this.getActionTypes()
  }

  getPromiseActionNames(type: string) {
    return {
      pending: type + this.pendingExtension,
      resolved: type + this.resolvedExtension,
      rejected: type + this.rejectedExtension,
    }
  }

  getActionTypes() {
    const {actions} = this
    return {
      put: this.getPromiseActionNames(actions.put),
      post: this.getPromiseActionNames(actions.post),
      delete: this.getPromiseActionNames(actions.delete),
      get: this.getPromiseActionNames(actions.get),
      getMany: this.getPromiseActionNames(actions.getMany),
    }
  }

  getUpdatedStatus(
    state: ICRUDStatus,
    method: ICRUDMethod,
    status: ICRUDMethodStatus,
  ): ICRUDStatus {
    return {
      ...state,
      [method]: status,
    }
  }

  getMethod(actionType: string): ICRUDMethod {
    const {get, put, post, delete: _delete, getMany} = this.actionTypes
    switch (actionType) {
      case get.pending:
      case get.rejected:
        return 'get'
      case put.pending:
      case put.rejected:
        return 'put'
      case post.pending:
      case post.rejected:
        return 'post'
      case _delete.pending:
      case _delete.rejected:
        return 'delete'
      case getMany.pending:
      case getMany.rejected:
        return 'getMany'
      default:
        throw new Error('Unknown action type: ' + actionType)
    }
  }

  getSuccessStatus(): ICRUDMethodStatus {
    return {
      isLoading: false,
      error: '',
    }
  }

  reduce = (state: ICRUDState<T>, action: ICRUDAction<T | T[]>)
  : ICRUDState<T> => {
    const {defaultState} = this
    state = state || defaultState

    const {get, put, post, delete: _delete, getMany} = this.actionTypes

    switch (action.type) {
      case put.pending:
      case post.pending:
      case _delete.pending:
      case getMany.pending:
      case get.pending:
        const pendingMethod = this.getMethod(action.type)
        return {
          ...state,
          status: this.getUpdatedStatus(state.status, pendingMethod, {
            isLoading: true,
            error: '',
          }),
        }

      case put.rejected:
      case post.rejected:
      case _delete.rejected:
      case getMany.rejected:
      case get.rejected:
        const rejectedMethod = this.getMethod(action.type)
        const rejectedAction = action as any
        return {
          ...state,
          status: this.getUpdatedStatus(state.status, rejectedMethod, {
            isLoading: false,
            error: rejectedAction.error
              ? rejectedAction.error.message
              : 'An error occurred',
          }),
        }

      case get.resolved:
        const getPayload = action.payload as T
        return {
          ...state,
          ids: [...state.ids, getPayload.id],
          byId: {
            [getPayload.id]: getPayload,
          },
          status: this.getUpdatedStatus(
            state.status, 'get', this.getSuccessStatus()),
        }
      case post.resolved:
        const postPayload = action.payload as T
        return {
          ...state,
          ids: [...state.ids, postPayload.id],
          byId: {
            [postPayload.id]: postPayload,
          },
          status: this.getUpdatedStatus(
            state.status, 'post', this.getSuccessStatus()),
        }
      case put.resolved:
        const putPayload = action.payload as T
        return {
          ...state,
          byId: {
            [putPayload.id]: putPayload,
          },
          status: this.getUpdatedStatus(
            state.status, 'put', this.getSuccessStatus()),
        }
      case _delete.resolved:
        const deletePayload = action.payload as T
        return {
          ...state,
          ids: state.ids.filter(id => id !== deletePayload.id),
          byId: without(state.byId, deletePayload.id),
          status: this.getUpdatedStatus(
            state.status, 'delete', this.getSuccessStatus()),
        }
      case getMany.resolved:
        const getManyPayload = action.payload as T[]
        return {
          ...state,
          ids: getManyPayload.map(item => item.id),
          byId: indexBy(getManyPayload, 'id' as any),
          status: this.getUpdatedStatus(
            state.status, 'getMany', this.getSuccessStatus()),
        }
      default:
        return state
    }
  }
}
