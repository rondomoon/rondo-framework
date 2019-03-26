import {HTTPClient} from '../http/HTTPClient'
import {IRoutes} from '@rondo/common'
import {IRequest} from '../http/IRequest'
import {IResponse} from '../http/IResponse'

interface IReqRes {
  req: IRequest
  res: IResponse
}

export class HTTPClientError extends Error {
  constructor(readonly request: IRequest, readonly response: IResponse) {
    super('HTTP Status: ' + response.status)
    Error.captureStackTrace(this)
  }
}

export interface IRequestStatus {
  request: IRequest
  finished: boolean
}

export class HTTPClientMock<T extends IRoutes> extends HTTPClient<T> {
  mocks: {[key: string]: IResponse} = {}
  requests: IRequestStatus[] = []

  protected waitPromise?: {
    resolve: (r: IReqRes) => void
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
      request: (req: IRequest): Promise<IResponse> => {
        const currentRequest: IRequestStatus = {
          request: req,
          finished: false,
        }
        this.requests.push(currentRequest)
        return new Promise((resolve, reject) => {
          const key = this.serialize(req)
          if (!this.mocks.hasOwnProperty(key)) {
            setImmediate(() => {
              const err = new Error('No mock for request: ' + key)
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

  protected serialize(req: IRequest) {
    return JSON.stringify(req, null, '  ')
  }

  /**
   * Adds a new mock. If a mock with the same signature exists, it will be
   * replaced. The signature is calculated using the `serialize()` method,
   * which just does a `JSON.stringify(req)`.
   */
  mockAdd(req: IRequest, data: any, status = 200): this {
    this.mocks[this.serialize(req)] = {data, status}
    return this
  }

  /**
   * Clear all mocks and recorded requests
   */
  mockClear(): this {
    this.requests = []
    this.mocks = {}
    return this
  }

  protected notify(r: IReqRes | Error) {
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
  async wait(): Promise<IReqRes> {
    expect(this.waitPromise).toBe(undefined)
    const result: IReqRes = await new Promise((resolve, reject) => {
      this.waitPromise = {resolve, reject}
    })
    await new Promise(resolve => setImmediate(resolve))
    return result
  }

}
