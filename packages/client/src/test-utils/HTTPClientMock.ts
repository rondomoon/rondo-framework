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

export class HTTPClientMock<T extends IRoutes> extends HTTPClient<T> {
  mocks: {[key: string]: IResponse} = {}
  requests: IRequest[] = []

  protected waitPromise?: {
    resolve: (r: IReqRes) => void
    reject: (err: Error) => void
  }

  constructor() {
    super()
  }

  createRequestor() {
    return {
      request: (req: IRequest): Promise<IResponse> => {
        this.requests.push(req)
        return new Promise((resolve, reject) => {
          const key = this.serialize(req)
          if (!this.mocks.hasOwnProperty(key)) {
            setImmediate(() => {
              const err = new Error('No mock for request: ' + key)
              reject(err)
              this.notify(err)
            })
            return
          }
          const res = this.mocks[key]
          setImmediate(() => {
            if (res.status >= 200 && res.status < 400) {
              resolve(res)
              this.notify({req, res})
              return
            }
            const error = new HTTPClientError(req, res)
            reject(error)
            this.notify(error)
          })
        })
      },
    }
  }

  protected serialize(req: IRequest) {
    return JSON.stringify(req, null, '  ')
  }

  mockAdd(req: IRequest, data: any, status = 200): this {
    this.mocks[this.serialize(req)] = {data, status}
    return this
  }

  mockClear(): this {
    this.requests = []
    this.mocks = {}
    return this
  }

  protected notify(r: IReqRes | Error) {
    if (!this.waitPromise) {
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

  async wait(): Promise<IReqRes> {
    expect(this.waitPromise).toBe(undefined)
    return new Promise((resolve, reject) => {
      this.waitPromise = {resolve, reject}
    })
  }

}
