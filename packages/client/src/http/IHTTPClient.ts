import {TMethod, IRoutes} from '@rondo/common'
import {ITypedRequestParams} from './ITypedRequestParams'

export interface IHTTPClient<T extends IRoutes> {
  request<
    P extends keyof T & string,
    M extends TMethod,
  >(params: ITypedRequestParams<T, P, M>): Promise<T[P][M]['response']>

  get<P extends keyof T & string>(
    path: P,
    query?: T[P]['get']['query'],
    params?: T[P]['get']['params'],
  ): Promise<T[P]['get']['response']>

  post<P extends keyof T & string>(
    path: P,
    body: T[P]['post']['body'],
    params?: T[P]['post']['params'],
  ): Promise<T[P]['post']['response']>

  put<P extends keyof T & string>(
    path: P,
    body: T[P]['put']['body'],
    params?: T[P]['put']['params'],
  ): Promise<T[P]['put']['response']>

  delete<P extends keyof T & string>(
    path: P,
    body: T[P]['delete']['body'],
    params?: T[P]['delete']['params'],
  ): Promise<T[P]['delete']['response']>

  head<P extends keyof T & string>(
    path: P,
    query?: T[P]['head']['query'],
    params?: T[P]['head']['params'],
  ): Promise<T[P]['head']['response']>

  options<P extends keyof T & string>(
    path: P,
    query?: T[P]['options']['query'],
    params?: T[P]['options']['params'],
  ): Promise<T[P]['options']['response']>

  patch<P extends keyof T & string>(
    path: P,
    body: T[P]['patch']['body'],
    params?: T[P]['patch']['params'],
  ): Promise<T[P]['patch']['response']>
}
