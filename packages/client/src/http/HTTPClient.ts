import assert from 'assert'
import axios from 'axios'
import {IHTTPClient} from './IHTTPClient'
import {IHeader} from './IHeader'
import {IMethod, IRoutes} from '@rondo/common'
import {IRequest} from './IRequest'
import {IResponse} from './IResponse'
import {ITypedRequestParams} from './ITypedRequestParams'

interface IRequestor {
  request: (params: IRequest) => Promise<IResponse>
}

export class HTTPClient<T extends IRoutes> implements IHTTPClient<T> {
  protected readonly requestor: IRequestor

  constructor(
    protected readonly baseURL = '',
    protected readonly headers?: IHeader,
  ) {
    this.requestor = this.createRequestor()
  }

  protected createRequestor(): IRequestor {
    return axios.create({
      baseURL: this.baseURL,
      headers: this.headers,
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

    const response = await this.requestor.request({
      method: params.method,
      url,
      params: params.query,
      data: params.body,
    })

    return response.data
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
