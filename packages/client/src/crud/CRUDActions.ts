import {IRoutes} from '@rondo/common'
import {IHTTPClient, ITypedRequestParams} from '../http'

export type Optional<T> = T extends {} ? T : undefined

interface ICRUDActionTypes {
  readonly get: string
  readonly put: string
  readonly post: string
  readonly delete: string
  readonly getMany: string
}

export class CRUDActions<
  T extends IRoutes,
  POST extends keyof T & string,
  GET_MANY extends keyof T & string,
  GET extends keyof T & string,
  PUT extends keyof T & string,
  DELETE extends keyof T & string,
> {
  readonly actionTypes: ICRUDActionTypes

  constructor(
    readonly http: IHTTPClient<T>,
    readonly postRoute: POST,
    readonly getManyRoute: GET_MANY,
    readonly getRoute: GET,
    readonly putRoute: PUT,
    readonly deleteRoute: DELETE,
    readonly actionName: string,
  ) {
    this.actionTypes = this.getActionTypes()
  }

  static fromTwoRoutes<
    R,
    S extends keyof R & string,
    L extends keyof R & string,
  >(params: {
      http: IHTTPClient<R>,
      specificRoute: S,
      listRoute: L,
      actionName: string,
    },
  ) {
    const {http, specificRoute, listRoute, actionName} = params
    return new CRUDActions<R, L, L, S, S, S>(
      http,
      listRoute,
      listRoute,
      specificRoute,
      specificRoute,
      specificRoute,
      actionName,
    )
  }

  getActionTypes(): ICRUDActionTypes {
    const {actionName} = this
    return {
      get: actionName + '_GET_PENDING',
      put: actionName + '_PUT_PENDING',
      post: actionName + '_POST_PENDING',
      delete: actionName + '_DELETE_PENDING',
      getMany: actionName + '_GET_MANY_PENDING',
    }
  }

  get(params: {
    query: Optional<T[GET]['get']['query']>,
    params: T[GET]['get']['params'],
  }) {
    return {
      payload: this.http.get(this.getRoute, params.query, params.params),
      type: this.actionTypes.get,
    }
  }

  post(params: {
    body: T[POST]['post']['body'],
    params: T[POST]['post']['params'],
  }) {
    return {
      payload: this.http.post(this.postRoute, params.body, params.params),
      type: this.actionTypes.post,
    }
  }

  put(params: {
    body: T[PUT]['put']['body'],
    params: T[PUT]['put']['params'],
  }) {
    return {
      payload: this.http.put(this.putRoute, params.body, params.params),
      type: this.actionTypes.put,
    }
  }

  delete(params: {
    body: T[DELETE]['delete']['body'],
    params: T[DELETE]['delete']['params'],
  }) {
    return {
      payload: this.http.delete(this.deleteRoute, params.body, params.params),
      type: this.actionTypes.delete,
    }
  }

  getMany(params: {
    query: Optional<T[GET_MANY]['get']['query']>,
    params: T[GET_MANY]['get']['params'],
  }) {
    return {
      payload: this.http.get(this.getManyRoute, params.query, params.params),
      type: this.actionTypes.getMany,
    }
  }
}
