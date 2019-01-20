import {HTTPClient} from './HTTPClient'
import {IRoutes} from '@rondo/common'
import {IRequest} from './IRequest'
import {IResponse} from './IResponse'

export class HTTPClientMock<T extends IRoutes> extends HTTPClient<T> {
  mocks: {[key: string]: any} = {}

  constructor() {
    super()
  }

  createRequestor() {
    return {
      request: (r: IRequest): Promise<IResponse> => {
        return new Promise((resolve, reject) => {
          const key = this.serialize(r)
          if (!this.mocks.hasOwnProperty(key)) {
            setImmediate(() => {
              reject(new Error('No mock for request: ' + key))
            })
            return
          }
          setImmediate(() => {
            resolve({data: this.mocks[key]})
          })
        })
      },
    }
  }

  serialize(r: IRequest) {
    return JSON.stringify(r, null, '  ')
  }

  mockAdd(r: IRequest, response: any) {
    this.mocks[this.serialize(r)] = response
  }

  mockClear() {
    this.mocks = []
  }

}
