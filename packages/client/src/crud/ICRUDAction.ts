import {IAsyncAction} from '../actions'
import {ICRUDMethod} from './ICRUDMethod'

export type ICRUDSaveAction<T, ActionType extends string> =
  IAsyncAction<T, ActionType> & {method: Extract<ICRUDMethod, 'save'>}

export type ICRUDUpdateAction<T, ActionType extends string> =
  IAsyncAction<T, ActionType> & {method: Extract<ICRUDMethod, 'update'>}

export type ICRUDRemoveAction<T, ActionType extends string> =
  IAsyncAction<T, ActionType> & {method: Extract<ICRUDMethod, 'remove'>}

export type ICRUDFindOneAction<T, ActionType extends string> =
  IAsyncAction<T, ActionType> & {method: Extract<ICRUDMethod, 'findOne'>}

export type ICRUDFindManyAction<T, ActionType extends string> =
  IAsyncAction<T[], ActionType> & {method: Extract<ICRUDMethod, 'findMany'>}

export type ICRUDAction<T, ActionType extends string> =
  ICRUDSaveAction<T, ActionType>
  | ICRUDUpdateAction<T, ActionType>
  | ICRUDRemoveAction<T, ActionType>
  | ICRUDFindOneAction<T, ActionType>
  | ICRUDFindManyAction<T, ActionType>
