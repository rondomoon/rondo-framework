import {IAction, IResolvedAction} from '../actions'
import {TCRUDAction} from './TCRUDAction'
import {TCRUDMethod} from './TCRUDMethod'
import {indexBy, without, TFilter} from '@rondo.dev/common'

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
  readonly status: ICRUDStatus
  readonly form: ICRUDForm<T>
}

export interface ICRUDForm<T extends ICRUDEntity> {
  readonly createItem: Pick<T, Exclude<keyof T, 'id'>>,
  readonly createErrors: Partial<Record<keyof T, string>>

  readonly itemsById: Record<number, T>
  readonly errorsById: Record<number, Partial<Record<keyof T, string>>>
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

  constructor(
    readonly actionName: ActionType,
    readonly newItem: Pick<T, Exclude<keyof T, 'id'>>,
  ) {

    const defaultMethodStatus = this.getDefaultMethodStatus()
    this.defaultState = {
      ids: [],
      byId: {},
      form: {
        itemsById: {},
        errorsById: {},
        createItem: newItem,
        createErrors: {},
      },

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
    const ids = !state.byId[payload.id]
      ? [...state.ids, payload.id]
      : state.ids
    return {
      ...state,
      ids,
      byId: {
        ...state.byId,
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
         ...state.byId,
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
    // FIXME site does not get removed because payload looks different!
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

  handleCreate = (state: ICRUDState<T>, payload: Partial<T>): ICRUDState<T> => {
    return {
      ...state,
      form: {
        ...state.form,
        createItem: {
          ...this.newItem,
          ...payload,
        },
        createErrors: {},
      },
    }
  }

  handleEdit = (state: ICRUDState<T>, id: number): ICRUDState<T> => {
    return {
      ...state,
      form: {
        ...state.form,
        itemsById: {
          ...state.form.itemsById,
          [id]: state.byId[id],
        },
        errorsById: {
          ...state.form.errorsById,
          [id]: {},
        },
      },
    }
  }

  handleChange = (state: ICRUDState<T>, payload: {
    id?: number,
    key: keyof T,
    value: string,
  }): ICRUDState<T> => {
    const {id, key, value} = payload

    if (!id) {
      return {
        ...state,
        form: {
          ...state.form,
          createItem: {
            ...state.form.createItem,
            [key]: value,
          },
        },
      }
    }

    return {
      ...state,
      form: {
        ...state.form,
        itemsById: {
          ...state.form.itemsById,
          [id]: {
            ...state.form.itemsById[id],
            [key]: value,
          },
        },
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

    if (!('status' in action)) {
      switch (action.method) {
        case 'change':
          return this.handleChange(state, action.payload)
        case 'edit':
          return this.handleEdit(state, action.payload.id)
        case 'create':
          return this.handleCreate(state, action.payload)
        default:
          return state
      }
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
