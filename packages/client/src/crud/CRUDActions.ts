import {IHTTPClient, ITypedRequestParams} from '../http'
import {IRoutes, TFilter, TOnlyDefined} from '@rondo/common'
import {TCRUDAction} from './TCRUDAction'
import {TCRUDChangeAction} from './TCRUDAction'
import {TCRUDCreateAction} from './TCRUDAction'
import {TCRUDEditAction} from './TCRUDAction'
import {TCRUDMethod} from './TCRUDMethod'

type TAction<T, ActionType extends string, Method extends TCRUDMethod> =
  TFilter<TCRUDAction<T, ActionType>, {method: Method, status: 'pending'}>

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

  save = (params: TOnlyDefined<{
    body: T[Route]['post']['body'],
    params: T[Route]['post']['params'],
  }>): TAction<T[Route]['post']['response'], ActionType, 'save'> => {
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

  findOne = (params: TOnlyDefined<{
    query: T[Route]['get']['query'],
    params: T[Route]['get']['params'],
  }>): TAction<T[Route]['get']['response'], ActionType, 'findOne'> => {
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

  update = (params: TOnlyDefined<{
    body: T[Route]['put']['body'],
    params: T[Route]['put']['params'],
  }>): TAction<T[Route]['put']['response'], ActionType, 'update'> => {
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

  remove = (params: TOnlyDefined<{
    body: T[Route]['delete']['body'],
    params: T[Route]['delete']['params'],
  }>): TAction<T[Route]['delete']['response'], ActionType, 'remove'> => {
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

  findMany = (params: TOnlyDefined<{
    query: T[Route]['get']['query'],
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

export class FormActionCreator<T, ActionType extends string> {
  constructor(readonly actionType: ActionType) {}

  create = (): TCRUDCreateAction<ActionType> => {
    return {
      payload: undefined,
      type: this.actionType,
      method: 'create',
    }
  }

  edit = (params: {id: number}): TCRUDEditAction<ActionType> => {
    return {
      payload: {id: params.id},
      type: this.actionType,
      method: 'edit',
    }
  }

  change = (params: {
    id?: number,
    key: keyof T,
    value: string
  }): TCRUDChangeAction<T, ActionType> => {
    return {
      payload: params,
      type: this.actionType,
      method: 'change',
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
