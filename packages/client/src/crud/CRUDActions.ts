import { Filter, OnlyDefined } from '@rondo.dev/common'
import { HTTPClient } from '@rondo.dev/http-client'
import { Routes } from '@rondo.dev/http-types'
import { CRUDAction, CRUDChangeAction, CRUDCreateAction, CRUDEditAction } from './CRUDAction'
import { CRUDMethod } from './CRUDMethod'

type Action <T, ActionType extends string, Method extends CRUDMethod> =
  Filter<CRUDAction<T, ActionType> , {method: Method, status: 'pending'}>

interface PostParams<Body = unknown, Params = unknown> {
  body: Body
  params: Params
}

interface GetParams<Query = unknown, Params = unknown> {
  query: Query
  params: Params
}

export interface CRUDChangeParams<T> {
  id?: number
  key: keyof T & string
  value: string
}

export class SaveActionCreator<
  T extends Routes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: HTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  save = (params: OnlyDefined<{
    body: T[Route]['post']['body']
    params: T[Route]['post']['params']
  }>): Action<T[Route]['post']['response'], ActionType, 'save'> => {
    const p = params as PostParams
    return {
      payload: this.http.post(this.route, p.body, p.params),
      type: this.type,
      method: 'save',
      status: 'pending',
    }
  }
}

export class FindOneActionCreator<
  T extends Routes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: HTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  findOne = (params: OnlyDefined<{
    query: T[Route]['get']['query']
    params: T[Route]['get']['params']
  }>): Action<T[Route]['get']['response'], ActionType, 'findOne'> => {
    const p = params as {query: unknown, params: unknown}
    return {
      payload: this.http.get(this.route, p.query, p.params),
      type: this.type,
      method: 'findOne',
      status: 'pending',
    }
  }

}

export class UpdateActionCreator<
  T extends Routes,
  Route extends keyof T & string,
  ActionType extends string
> {

  constructor(
    readonly http: HTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  update = (params: OnlyDefined<{
    body: T[Route]['put']['body']
    params: T[Route]['put']['params']
  }>): Action<T[Route]['put']['response'], ActionType, 'update'> => {
    const p = params as PostParams
    return {
      payload: this.http.put(this.route, p.body, p.params),
      type: this.type,
      method: 'update',
      status: 'pending',
    }
  }

}

export class RemoveActionCreator<
  T extends Routes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: HTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  remove = (params: OnlyDefined<{
    body: T[Route]['delete']['body']
    params: T[Route]['delete']['params']
  }>): Action<T[Route]['delete']['response'], ActionType, 'remove'> => {
    const p = params as PostParams
    return {
      payload: this.http.delete(this.route, p.body, p.params),
      type: this.type,
      method: 'remove',
      status: 'pending',
    }
  }
}

export class FindManyActionCreator<
  T extends Routes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: HTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  findMany = (params: OnlyDefined<{
    query: T[Route]['get']['query']
    params: T[Route]['get']['params']
  }>): {
    payload: Promise<T[Route]['get']['response']>
    type: ActionType
    status: 'pending'
    method: 'findMany'
  } => {
    const p = params as GetParams
    return {
      payload: this.http.get(this.route, p.query, p.params),
      type: this.type,
      method: 'findMany',
      status: 'pending',
    }
  }

}

export class FormActionCreator<T, ActionType extends string> {
  constructor(readonly actionType: ActionType) {}

  create = (item: Partial<T>): CRUDCreateAction<T, ActionType> => {
    return {
      payload: item,
      type: this.actionType,
      method: 'create',
    }
  }

  edit = (params: {id: number}): CRUDEditAction<ActionType> => {
    return {
      payload: {id: params.id},
      type: this.actionType,
      method: 'edit',
    }
  }

  change = (
    params: CRUDChangeParams<T>,
  ): CRUDChangeAction<T, ActionType> => {
    return {
      payload: params,
      type: this.actionType,
      method: 'change',
    }
  }
}

export function createCRUDActions<
  T extends Routes,
  EntityRoute extends keyof T & string,
  ListRoute extends keyof T & string,
  ActionType extends string,
>(
  http: HTTPClient<T>,
  entityRoute: EntityRoute,
  listRoute: ListRoute,
  actionType: ActionType,
) {
  const {save} = new SaveActionCreator(http, listRoute, actionType)
  const {update} = new UpdateActionCreator(http, entityRoute, actionType)
  const {remove} = new RemoveActionCreator(http, entityRoute, actionType)
  const {findOne} = new FindOneActionCreator(http, entityRoute, actionType)
  const {findMany} = new FindManyActionCreator(http, listRoute, actionType)

  const {create, edit, change} = new FormActionCreator
    <T[ListRoute]['post']['body'], ActionType>(actionType)

  return {
    save,
    update,
    remove,
    findOne,
    findMany,
    create,
    edit,
    change,
  }
}
