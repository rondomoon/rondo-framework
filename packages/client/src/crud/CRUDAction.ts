import {Action, AsyncAction} from '@rondo.dev/redux'
import {CRUDMethod} from './CRUDMethod'

// Async actions

export type CRUDSaveAction<T, ActionType extends string> =
  AsyncAction<T, ActionType> & {method: Extract<CRUDMethod, 'save'>}

export type CRUDUpdateAction<T, ActionType extends string> =
  AsyncAction<T, ActionType> & {method: Extract<CRUDMethod, 'update'>}

export type CRUDRemoveAction<T, ActionType extends string> =
  AsyncAction<T, ActionType> & {method: Extract<CRUDMethod, 'remove'>}

export type CRUDFindOneAction<T, ActionType extends string> =
  AsyncAction<T, ActionType> & {method: Extract<CRUDMethod, 'findOne'>}

export type CRUDFindManyAction<T, ActionType extends string> =
  AsyncAction<T[], ActionType> & {method: Extract<CRUDMethod, 'findMany'>}

// Synchronous actions

export type CRUDCreateAction<T, ActionType extends string> =
  Action<Partial<T>, ActionType> & {method: Extract<CRUDMethod, 'create'>}

export type CRUDEditAction<ActionType extends string> =
  Action<{id: number}, ActionType> & {method: Extract<CRUDMethod, 'edit'>}

export type CRUDChangeAction<T, ActionType extends string> =
  Action<{id?: number, key: keyof T, value: string}, ActionType>
  & {method: Extract<CRUDMethod, 'change'>}

export type CRUDAction<T, ActionType extends string> =
  CRUDSaveAction<T, ActionType>
  | CRUDUpdateAction<T, ActionType>
  | CRUDRemoveAction<T, ActionType>
  | CRUDFindOneAction<T, ActionType>
  | CRUDFindManyAction<T, ActionType>
  | CRUDCreateAction<T, ActionType>
  | CRUDEditAction<ActionType>
  | CRUDChangeAction<T, ActionType>
