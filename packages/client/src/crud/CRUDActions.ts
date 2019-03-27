import {IRoutes} from '@rondo/common'
import {IHTTPClient, ITypedRequestParams} from '../http'

interface IActionTypes {
  readonly get: string
  readonly put: string
  readonly post: string
  readonly delete: string
  readonly getMany: string
}

export class CRUDActions<
  T extends IRoutes,
  GET extends keyof T & string,
  PUT extends keyof T & string,
  POST extends keyof T & string,
  DELETE extends keyof T & string,
  GET_MANY extends keyof T & string,
> {
  readonly actionTypes: IActionTypes

  constructor(
    readonly http: IHTTPClient<T>,
    readonly getRoute: GET,
    readonly putRoute: PUT,
    readonly postRoute: POST,
    readonly deleteRoute: DELETE,
    readonly getManyRoute: GET_MANY,
    readonly actionName: string,
  ) {
    this.actionTypes = this.getActionTypes()
  }

  static fromTwoRoutes<
    R,
    S extends keyof R & string,
    P extends keyof R & string,
  >(params: {
    http: IHTTPClient<R>,
    singular: S,
    plural: P,
    actionName: string
  }) {
    const {http, singular, plural, actionName} = params
    return new CRUDActions<R, S, S, P, S, P>(
      http,
      singular,
      singular,
      plural,
      singular,
      plural,
      actionName,
    )
  }

  getActionTypes(): IActionTypes {
    const {actionName} = this
    return {
      get: actionName + '_GET_PENDING',
      put: actionName + '_PUT_PENDING',
      post: actionName + '_POST_PENDING',
      delete: actionName + '_DELETE_PENDING',
      getMany: actionName + '_GET_MANY_PENDING',
    }
  }

  async get(params: {
    query: T[GET]['get']['query'],
    params: T[GET]['get']['params'],
  }) {
    return {
      payload: this.http.get(this.getRoute, params.query, params.params),
      type: this.actionTypes.get,
    }
  }

  async post(params: {
    body: T[POST]['post']['body'],
    params: T[POST]['post']['params'],
  }) {
    return {
      payload: this.http.post(this.postRoute, params.body, params.params),
      type: this.actionTypes.post,
    }
  }

  async put(params: {
    body: T[PUT]['put']['body'],
    params: T[PUT]['put']['params'],
  }) {
    return {
      payload: this.http.put(this.putRoute, params.body, params.params),
      type: this.actionTypes.put,
    }
  }

  async delete(params: {
    body: T[DELETE]['delete']['body'],
    params: T[DELETE]['delete']['params'],
  }) {
    return {
      payload: this.http.delete(this.deleteRoute, params.body, params.params),
      type: this.actionTypes.delete,
    }
  }

  async getMany(params: {
    query: T[GET_MANY]['get']['query'],
    params: T[GET_MANY]['get']['params'],
  }) {
    return {
      payload: this.http.get(this.getManyRoute, params.query, params.params),
      type: this.actionTypes.getMany,
    }
  }
}
