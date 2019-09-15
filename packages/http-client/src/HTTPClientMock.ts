import {SimpleHTTPClient} from './SimpleHTTPClient'
import {Request} from './Request'
import {Response} from './Response'
import {Routes, Method} from '@rondo.dev/http-types'
import {TypedRequestParams} from './TypedRequestParams'

interface ReqRes {
  req: Request
  res: Response
}

export class HTTPClientError extends Error {
  constructor(readonly request: Request, readonly response: Response) {
    super('HTTP Status: ' + response.status)
    Error.captureStackTrace(this)
  }
}

export interface RequestStatus {
  request: Request
  finished: boolean
}

export class HTTPClientMock<T extends Routes> extends SimpleHTTPClient<T> {
  mocks: {[key: string]: Response} = {}
  requests: RequestStatus[] = []

  protected waitPromise?: {
    resolve: (r: ReqRes) => void
    reject: (err: Error) => void
  }

  constructor() {
    super()
  }

  /**
   * Mock the http client.
   */
  createRequestor() {
    return {
      request: (req: Request): Promise<Response> => {
        const currentRequest: RequestStatus = {
          request: req,
          finished: false,
        }
        this.requests.push(currentRequest)
        return new Promise((resolve, reject) => {
          const key = this.serialize(req)
          if (!Object.prototype.hasOwnProperty.call(this.mocks, key)) {
            setImmediate(() => {
              const err = new Error(
                'No mock for request: ' + key + '\nAvailable mocks: ' +
                Object.keys(this.mocks))
              reject(err)
              currentRequest.finished = true
              this.notify(err)
            })
            return
          }
          const res = this.mocks[key]
          setImmediate(() => {
            if (res.status >= 200 && res.status < 400) {
              resolve(res)
              currentRequest.finished = true
              this.notify({req, res})
              return
            }
            const error = new HTTPClientError(req, res)
            reject(error)
            currentRequest.finished = true
            this.notify(error)
          })
        })
      },
    }
  }

  protected serialize(req: Request) {
    return JSON.stringify({
      method: req.method,
      url: req.url,
      params: req.params,
      data: req.data,
    }, null, '  ')
  }

  /**
   * Adds a new mock. If a mock with the same signature exists, it will be
   * replaced. The signature is calculated using the `serialize()` method,
   * which just does a `JSON.stringify(req)`.
   */
  mockAdd(req: Request, data: any, status = 200): this {
    this.mocks[this.serialize(req)] = {data, status}
    return this
  }

  /**
   * Adds a new mock with predefined type
   */
  mockAddTyped<P extends keyof T & string, M extends Method>(
    params: TypedRequestParams<T, P, M>,
    response: T[P][M]['response'],
  ): this {
    const url = this.formatter.format(params.path, params.params)
    return this.mockAdd({
      method: params.method,
      url,
      params: params.query,
      data: params.body,
    }, response)
  }

  /**
   * Clear all mocks and recorded requests
   */
  mockClear(): this {
    this.requests = []
    this.mocks = {}
    return this
  }

  protected notify(r: ReqRes | Error) {
    if (!this.waitPromise) {
      return
    }
    if (!this.requests.every(status => status.finished)) {
      return
    }
    const waitPromise = this.waitPromise
    this.waitPromise = undefined
    if (r instanceof Error) {
      waitPromise.reject(r)
      return
    }
    waitPromise.resolve(r)
  }

  /**
   * Returns a new promise which will be resolve/rejected as soon as the next
   * HTTP promise is resolved or rejected. Useful during testing, when the
   * actual request promise is inaccessible.
   *
   * Example usage:
   *
   *     TestUtils.Simulate.submit(node)  // This triggers a HTTP request
   *     const {req, res} = await httpMock.wait()
   *     expect(req).toEqual({method:'get', url:'/auth/post', data: {...}})
   */
  async wait(): Promise<ReqRes> {
    if (this.requests.every(r => r.finished)) {
      throw new Error('No requests to wait for')
    }
    expect(this.waitPromise).toBe(undefined)
    const result: ReqRes = await new Promise((resolve, reject) => {
      this.waitPromise = {resolve, reject}
    })
    // TODO think of a better way to do this.
    // We wait for all http request promise handlers to execute...
    await new Promise(resolve => setTimeout(resolve))
    return result
  }

}
