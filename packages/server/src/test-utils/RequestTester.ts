/* eslint @typescript-eslint/no-explicit-any: 0 */
import { Headers, URLFormatter } from '@rondo.dev/http-client'
import { Routes, Method } from '@rondo.dev/http-types'
import supertest from 'supertest'

// https://stackoverflow.com/questions/48215950/exclude-property-from-type
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface Test extends Omit<supertest.Test, 'then' | 'catch' | 'finally'> {}

interface Response<
  R extends Routes,
  P extends keyof R,
  M extends Method,
> extends supertest.Response {
  body: R[P][M]['response']
  header: {[key: string]: string}
}

interface Request<
  R extends Routes,
  P extends keyof R,
  M extends Method,
> extends Test, Promise<Response<R, P, M>> {
  send(value: R[P][M]['body'] | string): this
  expect(status: number, body?: any): this
  expect(
    body: string | RegExp | object | ((res: Response<R, P, M>,
  ) => any)): this
  expect(field: string, val: string | RegExp): this
  // any other method that's called will return "this" from supertest's
  // or superagent's type definition and afterwards the promise will no longer
  // contain type definitions. if you use any other methods, add them to this
  // type definition
}

interface RequestOptions<
  R extends Routes,
  P extends keyof R,
  M extends Method,
> {
  params?: R[P][M]['params']
  query?: R[P][M]['query']
}

export class RequestTester<R extends Routes> {

  protected headers: Headers = {}
  protected formatter: URLFormatter = new URLFormatter()

  constructor(
    readonly app: Express.Application,
    readonly baseUrl = '',
  ) {}

  setHeaders(headers: Headers): this {
    this.headers = headers
    return this
  }

  request<M extends Method, P extends keyof R & string>(
    method: M, path: P, options: RequestOptions<R, P, 'post'> = {},
  ): Request<R, P, M> {
    const url = this.formatter.format(path, options.params, options.query)
    const test = supertest(this.app)[method](`${this.baseUrl}${url}`)
    Object.keys(this.headers).forEach(key => {
      test.set(key, this.headers[key])
    })
    return test
  }

  get<P extends keyof R & string>(
    path: P,
    options?: RequestOptions<R, P, 'get'>,
  ) {
    return this.request('get', path, options)
  }

  post<P extends keyof R & string>(
    path: P,
    options?: RequestOptions<R, P, 'post'>,
  ) {
    return this.request('post', path, options)
  }

  put<P extends keyof R & string>(
    path: P,
    options?: RequestOptions<R, P, 'put'>,
  ) {
    return this.request('put', path, options)
  }

  delete<P extends keyof R & string>(
    path: P,
    options?: RequestOptions<R, P, 'delete'>,
  ) {
    return this.request('delete', path, options)
  }
}
