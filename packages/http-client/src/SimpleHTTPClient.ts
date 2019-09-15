import axios from 'axios'
import {HTTPClient} from './HTTPClient'
import {Headers} from './Headers'
import {Method, Routes} from '@rondo.dev/http-types'
import {URLFormatter} from './URLFormatter'
import {Request} from './Request'
import {Response} from './Response'
import {TypedRequestParams} from './TypedRequestParams'

interface Requestor {
  request: (params: Request) => Promise<Response>
}

export class SimpleHTTPClient<T extends Routes> implements HTTPClient<T> {
  protected readonly requestor: Requestor
  protected readonly formatter: URLFormatter

  constructor(
    protected readonly baseURL = '',
    protected readonly headers?: Headers,
  ) {
    this.requestor = this.createRequestor()
    this.formatter = new URLFormatter()
  }

  protected createRequestor(): Requestor {
    return axios.create({
      baseURL: this.baseURL,
      headers: this.headers,
    })
  }

  async request<
    P extends keyof T & string,
    M extends Method,
  >(params: TypedRequestParams<T, P, M>): Promise<T[P][M]['response']> {

    const url = this.formatter.format(params.path, params.params)

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
