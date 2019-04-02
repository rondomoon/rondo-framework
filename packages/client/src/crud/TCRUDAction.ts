import {TAsyncAction} from '../actions'
import {TCRUDMethod} from './TCRUDMethod'

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

export type TCRUDAction<T, ActionType extends string> =
  TCRUDSaveAction<T, ActionType>
  | TCRUDUpdateAction<T, ActionType>
  | TCRUDRemoveAction<T, ActionType>
  | TCRUDFindOneAction<T, ActionType>
  | TCRUDFindManyAction<T, ActionType>
