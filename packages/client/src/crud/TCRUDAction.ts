import {IAction, TAsyncAction} from '../actions'
import {TCRUDMethod} from './TCRUDMethod'

// Async actions

export type TCRUDSaveAction<T, ActionType extends string> =
  TAsyncAction<T, ActionType> & {method: Extract<TCRUDMethod, 'save'>}

export type TCRUDUpdateAction<T, ActionType extends string> =
  TAsyncAction<T, ActionType> & {method: Extract<TCRUDMethod, 'update'>}

export type TCRUDRemoveAction<T, ActionType extends string> =
  TAsyncAction<T, ActionType> & {method: Extract<TCRUDMethod, 'remove'>}

export type TCRUDFindOneAction<T, ActionType extends string> =
  TAsyncAction<T, ActionType> & {method: Extract<TCRUDMethod, 'findOne'>}

export type TCRUDFindManyAction<T, ActionType extends string> =
  TAsyncAction<T[], ActionType> & {method: Extract<TCRUDMethod, 'findMany'>}

// Synchronous actions

export type TCRUDCreateAction<T, ActionType extends string> =
  IAction<Partial<T>, ActionType> & {method: Extract<TCRUDMethod, 'create'>}

export type TCRUDEditAction<ActionType extends string> =
  IAction<{id: number}, ActionType> & {method: Extract<TCRUDMethod, 'edit'>}

export type TCRUDChangeAction<T, ActionType extends string> =
  IAction<{id?: number, key: keyof T, value: string}, ActionType>
  & {method: Extract<TCRUDMethod, 'change'>}

export type TCRUDAction<T, ActionType extends string> =
  TCRUDSaveAction<T, ActionType>
  | TCRUDUpdateAction<T, ActionType>
  | TCRUDRemoveAction<T, ActionType>
  | TCRUDFindOneAction<T, ActionType>
  | TCRUDFindManyAction<T, ActionType>
  | TCRUDCreateAction<T, ActionType>
  | TCRUDEditAction<ActionType>
  | TCRUDChangeAction<T, ActionType>
