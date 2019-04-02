import {ICRUDAction} from './ICRUDAction'
import {ICRUDMethod} from './ICRUDMethod'
import {IHTTPClient, ITypedRequestParams} from '../http'
import {IRoutes} from '@rondo/common'

export type Optional<T> = T extends {} ? T : undefined

type Filter<T, U> = T extends U ? T : never

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

  save = (params: {
    body: T[Route]['post']['body'],
    params: T[Route]['post']['params'],
  }): Action<T[Route]['post']['response'], ActionType, 'save'> => {
    return {
      payload: this.http.post(this.route, params.body, params.params),
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

  findOne = (params: {
    query: Optional<T[Route]['get']['query']>,
    params: T[Route]['get']['params'],
  }): Action<T[Route]['get']['response'], ActionType, 'findOne'> => {
    return {
      payload: this.http.get(this.route, params.query, params.params),
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

  update = (params: {
    body: T[Route]['put']['body'],
    params: T[Route]['put']['params'],
  }): Action<T[Route]['put']['response'], ActionType, 'update'> => {
    return {
      payload: this.http.put(this.route, params.body, params.params),
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

  remove = (params: {
    body: T[Route]['delete']['body'],
    params: T[Route]['delete']['params'],
  }): Action<T[Route]['delete']['response'], ActionType, 'remove'> => {
    return {
      payload: this.http.delete(this.route, params.body, params.params),
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

  findMany = (params: {
    query: Optional<T[Route]['get']['query']>,
    params: T[Route]['get']['params'],
  }): Action<T[Route]['get']['response'], ActionType, 'findMany'> => {
    return {
      payload: this.http.get(this.route, params.query, params.params),
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
  const {save} = new SaveActionCreator(http, entityRoute, actionType)
  const {update} = new UpdateActionCreator(http, listRoute, actionType)
  const {remove} = new RemoveActionCreator(http, listRoute, actionType)
  const {findOne} = new FindOneActionCreator(http, listRoute, actionType)
  const {findMany} = new FindManyActionCreator(http, entityRoute, actionType)

  return {save, update, remove, findOne, findMany}
}
