import supertest from 'supertest'
import {
  IMethod,
  IRequestParams,
  IRoutes,
  URLFormatter,
} from '@rondo/common'

// https://stackoverflow.com/questions/48215950/exclude-property-from-type
type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>

interface ITest extends Omit<Omit<supertest.Test, 'then'>, 'catch'> {}

interface IResponse<
  R extends IRoutes,
  P extends keyof R,
  M extends IMethod,
> extends supertest.Response {
  body: R[P][M]['response']
  header: {[key: string]: string}
}

interface IRequest<
  R extends IRoutes,
  P extends keyof R,
  M extends IMethod,
> extends ITest, Promise<IResponse<R, P, M>> {
  send(value: R[P][M]['body'] | string): this
  expect(status: number, body?: any): this
  expect(body: string | RegExp | object | ((res: Response) => any)): this
  expect(field: string, val: string | RegExp): this
  // any other method that's called will return "this" from supertest's
  // or superagent's type definition and afterwards the promise will no longer
  // contain type definitions. if you use any other methods, add them to this
  // type definition
}

export interface IHeaders {
  [key: string]: string
}

export class RequestTester<R extends IRoutes> {

  protected headers: IHeaders = {}
  protected formatter: URLFormatter = new URLFormatter()

  constructor(
    readonly app: Express.Application,
    readonly baseUrl = '',
  ) {}

  setHeaders(headers: IHeaders): this {
    this.headers = headers
    return this
  }

  request<M extends IMethod, P extends keyof R & string>(
    method: M, path: P, params?: IRequestParams,
  )
  : IRequest<R, P, M> {
    const url = this.formatter.format(path, params)
    const test = supertest(this.app)[method](`${this.baseUrl}${url}`)
    Object.keys(this.headers).forEach(key => {
      test.set(key, this.headers[key])
    })
    return test
  }

  get<P extends keyof R & string>(path: P, params?: IRequestParams) {
    return this.request('get', path, params)
  }

  post<P extends keyof R & string>(path: P, params?: IRequestParams) {
    return this.request('post', path, params)
  }
}
