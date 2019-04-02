import {ICRUDAction} from './ICRUDAction'
import {ICRUDMethod} from './ICRUDMethod'
import {IHTTPClient, ITypedRequestParams} from '../http'
import {IRoutes, Filter, OnlyDefined} from '@rondo/common'

export type Optional<T> = T extends {} ? T : undefined

type Action<T, ActionType extends string, Method extends ICRUDMethod> =
  Filter<ICRUDAction<T, ActionType>, {method: Method, status: 'pending'}>

export class SaveActionCreator<
  T extends IRoutes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: IHTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  save = (params: OnlyDefined<{
    body: T[Route]['post']['body'],
    params: T[Route]['post']['params'],
  }>): Action<T[Route]['post']['response'], ActionType, 'save'> => {
    const p = params as any
    return {
      payload: this.http.post(this.route, p.body, p.params),
      type: this.type,
      method: 'save',
      status: 'pending',
    }
  }
}

export class FindOneActionCreator<
  T extends IRoutes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: IHTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  findOne = (params: OnlyDefined<{
    query: Optional<T[Route]['get']['query']>,
    params: T[Route]['get']['params'],
  }>): Action<T[Route]['get']['response'], ActionType, 'findOne'> => {
    const p = params as any
    return {
      payload: this.http.get(this.route, p.query, p.params),
      type: this.type,
      method: 'findOne',
      status: 'pending',
    }
  }

}

export class UpdateActionCreator<
  T extends IRoutes,
  Route extends keyof T & string,
  ActionType extends string
> {

  constructor(
    readonly http: IHTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  update = (params: OnlyDefined<{
    body: T[Route]['put']['body'],
    params: T[Route]['put']['params'],
  }>): Action<T[Route]['put']['response'], ActionType, 'update'> => {
    const p = params as any
    return {
      payload: this.http.put(this.route, p.body, p.params),
      type: this.type,
      method: 'update',
      status: 'pending',
    }
  }

}

export class RemoveActionCreator<
  T extends IRoutes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: IHTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  remove = (params: OnlyDefined<{
    body: Optional<T[Route]['delete']['body']>,
    params: T[Route]['delete']['params'],
  }>): Action<T[Route]['delete']['response'], ActionType, 'remove'> => {
    const p = params as any
    return {
      payload: this.http.delete(this.route, p.body, p.params),
      type: this.type,
      method: 'remove',
      status: 'pending',
    }
  }
}

export class FindManyActionCreator<
  T extends IRoutes,
  Route extends keyof T & string,
  ActionType extends string,
> {

  constructor(
    readonly http: IHTTPClient<T>,
    readonly route: Route,
    readonly type: ActionType,
  ) {}

  findMany = (params: OnlyDefined<{
    query: Optional<T[Route]['get']['query']>,
    params: T[Route]['get']['params'],
  }>): {
    payload: Promise<T[Route]['get']['response']>
    type: ActionType
    status: 'pending',
    method: 'findMany',
  } => {
    const p = params as any
    return {
      payload: this.http.get(this.route, p.query, p.params),
      type: this.type,
      method: 'findMany',
      status: 'pending',
    }
  }

}

export function createCRUDActions<
  T extends IRoutes,
  EntityRoute extends keyof T & string,
  ListRoute extends keyof T & string,
  ActionType extends string,
>(
  http: IHTTPClient<T>,
  entityRoute: EntityRoute,
  listRoute: ListRoute,
  actionType: ActionType,
) {
  const {save} = new SaveActionCreator(http, listRoute, actionType)
  const {update} = new UpdateActionCreator(http, entityRoute, actionType)
  const {remove} = new RemoveActionCreator(http, entityRoute, actionType)
  const {findOne} = new FindOneActionCreator(http, entityRoute, actionType)
  const {findMany} = new FindManyActionCreator(http, listRoute, actionType)

  return {save, update, remove, findOne, findMany}
}
