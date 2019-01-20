import {HTTPClient} from '../http/HTTPClient'
import {IRoutes} from '@rondo/common'
import {IRequest} from '../http/IRequest'
import {IResponse} from '../http/IResponse'

interface IReqRes {
  req: IRequest
  res: IResponse
}

export class HTTPClientMock<T extends IRoutes> extends HTTPClient<T> {
  mocks: {[key: string]: any} = {}
  requests: IRequest[] = []

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
          const data = this.mocks[key]
          const res: IResponse = {data}
          setImmediate(() => {
            resolve(res)
            this.notify({req, res})
          })
        })
      },
    }
  }

  serialize(req: IRequest) {
    return JSON.stringify(req, null, '  ')
  }

  mockAdd(req: IRequest, res: any) {
    this.mocks[this.serialize(req)] = res
  }

  mockClear() {
    this.requests = []
    this.mocks = {}
  }

  protected waitPromise?: {
    resolve: (r: IReqRes) => void
    reject: (err: Error) => void
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
