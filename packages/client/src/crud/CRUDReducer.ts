import { indexBy, without } from '@rondo.dev/common'
import { CRUDAction } from './CRUDAction'
import { CRUDMethod } from './CRUDMethod'

export interface CRUDEntity {
  readonly id: number
}

export interface CRUDMethodStatus {
  readonly isLoading: boolean
  readonly error: string
}

export interface CRUDState<T extends CRUDEntity> {
  readonly ids: ReadonlyArray<number>
  readonly byId: Record<number, T>
  readonly status: CRUDStatus
  readonly form: CRUDForm<T>
}

export interface CRUDForm<T extends CRUDEntity> {
  readonly createItem: Pick<T, Exclude<keyof T, 'id'>>
  readonly createErrors: Partial<Record<keyof T, string>>

  readonly itemsById: Record<number, T>
  readonly errorsById: Record<number, Partial<Record<keyof T, string>>>
}

export interface CRUDStatus {
  readonly save: CRUDMethodStatus
  readonly update: CRUDMethodStatus
  readonly remove: CRUDMethodStatus
  readonly findOne: CRUDMethodStatus
  readonly findMany: CRUDMethodStatus
}

export class CRUDReducer<
  T extends CRUDEntity,
  ActionType extends string,
> {
  readonly defaultState: CRUDState<T>

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

  getDefaultMethodStatus(): CRUDMethodStatus {
    return {
      error: '',
      isLoading: false,
    }
  }

  protected getSuccessStatus(): CRUDMethodStatus {
    return {
      isLoading: false,
      error: '',
    }
  }

  handleRejected = (
    state: CRUDState<T>,
    method: CRUDMethod,
    error: Error,
  ): CRUDState<T> => {
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
    state: CRUDState<T>,
    method: CRUDMethod,
  ): CRUDState<T> => {
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

  handleFindOne = (state: CRUDState<T>, payload: T): CRUDState<T> => {
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

  handleSave = (state: CRUDState<T>, payload: T): CRUDState<T> => {
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

  handleUpdate = (state: CRUDState<T>, payload: T): CRUDState<T> => {
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

  handleRemove = (state: CRUDState<T>, payload: T): CRUDState<T> => {
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

  handleFindMany = (state: CRUDState<T>, payload: T[]): CRUDState<T> => {
    return {
      ...state,
      ids: payload.map(item => item.id),
      byId: indexBy(payload, 'id' as any),  // eslint-disable-line
      status: {
        ...state.status,
        findMany: this.getSuccessStatus(),
      },
    }
  }

  handleCreate = (state: CRUDState<T>, payload: Partial<T>): CRUDState<T> => {
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

  handleEdit = (state: CRUDState<T>, id: number): CRUDState<T> => {
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

  handleChange = (state: CRUDState<T>, payload: {
    id?: number
    key: keyof T
    value: string
  }): CRUDState<T> => {
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
    state: CRUDState<T> | undefined,
    action: CRUDAction<T, ActionType>,
  ): CRUDState<T> => {
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
        return state
      default:
        return state
    }
  }
}
