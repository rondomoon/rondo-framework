import assert from 'assert'
import axios, {AxiosInstance} from 'axios'
import {IHTTPClient} from './IHTTPClient'
import {IHeader} from './IHeader'
import {IMethod, IRoutes} from '@rondo/common'
import {ITypedRequestParams} from './ITypedRequestParams'

export class HTTPClient<T extends IRoutes> implements IHTTPClient<T> {
  protected readonly axios: AxiosInstance

  constructor(baseURL = '', headers?: IHeader) {
    this.axios = axios.create({
      baseURL,
      headers,
    })
  }

  async request<
    P extends keyof T & string,
    M extends IMethod,
  >(params: ITypedRequestParams<T, P, M>): Promise<T[P][M]['response']> {

    const url = params.path.replace(/:[a-zA-Z0-9-]+/g, (match) => {
      const key = match.substring(1)
      assert(params.params, 'Params is required, but not defined')
      assert(params.params!.hasOwnProperty(key))
      return params.params![key]
    })

    return this.axios.request({
      method: params.method,
      url,
      params: params.query,
      data: params.body,
    })
  }

  get<P extends keyof T & string>(
    path: P,
    query?: T[P]['get']['query'],
    params?: T[P]['get']['params'],
  ) {
    return this.request({
      method: 'get',
      path,
      query,
      params,
    })
  }

  post<P extends keyof T & string>(
    path: P,
    body: T[P]['post']['body'],
    params?: T[P]['post']['params'],
  ) {
    return this.request({
      method: 'post',
      path,
      body,
      params,
    })
  }

  put<P extends keyof T & string>(
    path: P,
    body: T[P]['put']['body'],
    params?: T[P]['put']['params'],
  ) {
    return this.request({
      method: 'put',
      path,
      body,
      params,
    })
  }

  delete<P extends keyof T & string>(
    path: P,
    body: T[P]['delete']['body'],
    params?: T[P]['delete']['params'],
  ) {
    return this.request({
      method: 'delete',
      path,
      body,
      params,
    })
  }

  head<P extends keyof T & string>(
    path: P,
    query?: T[P]['head']['query'],
    params?: T[P]['head']['params'],
  ) {
    return this.request({
      method: 'head',
      path,
      params,
      query,
    })
  }

  options<P extends keyof T & string>(
    path: P,
    query?: T[P]['options']['query'],
    params?: T[P]['options']['params'],
  ) {
    return this.request({
      method: 'options',
      path,
      params,
      query,
    })
  }

  patch<P extends keyof T & string>(
    path: P,
    body: T[P]['patch']['body'],
    params?: T[P]['patch']['params'],
  ) {
    return this.request({
      method: 'patch',
      path,
      body,
      params,
    })
  }
}
