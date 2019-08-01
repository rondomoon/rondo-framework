/**
 * @jest-environment node
 */

import bodyParser from 'body-parser'
import express from 'express'
import {AddressInfo} from 'net'
import {Server} from 'http'
import {createReduxClient} from './redux'
import {createRemoteClient} from './remote'
import {jsonrpc} from './express'
import {keys} from 'ts-transformer-keys'
import {TActionCreators, TAllActions} from './types'

describe('createReduxClient', () => {

  interface IService {
    add(a: number, b: number): number
    addAsync(a: number, b: number): Promise<number>
    addStringsAsync(a: string, b: string): Promise<string>
    addWithContext(a: number, b: number): (ctx: IContext) => number
    addAsyncWithContext(a: number, b: number): (ctx: IContext) =>
      Promise<number>
  }

  interface IContext {
    userId: number
  }

  class Service implements IService {
    add(a: number, b: number) {
      return a + b
    }
    addAsync(a: number, b: number) {
      return new Promise<number>(resolve => resolve(a + b))
    }
    addStringsAsync(a: string, b: string) {
      return new Promise<string>(resolve => resolve(a + b))
    }
    addWithContext = (a: number, b: number) => (ctx: IContext) =>
      a + b + ctx.userId
    addAsyncWithContext = (a: number, b: number) => (ctx: IContext) =>
      new Promise<number>(resolve => resolve(a + b + ctx.userId))
  }

  const app = express()
  app.use(bodyParser.json())
  app.use('/service', jsonrpc(new Service(), keys<IService>(), () => ({
    userId: 1000,
  })))

  let baseUrl: string
  let server: Server
  beforeEach(async () => {
    await new Promise(resolve => {
      server = app.listen(0, '127.0.0.1', resolve)
    })
    const addr = server.address() as AddressInfo
    baseUrl = `http://${addr.address}:${addr.port}`
  })

  afterEach(() => {
    return new Promise(resolve => {
      server.close(resolve)
    })
  })

  function getClient() {
    const remoteClient = createRemoteClient<IService>(
      baseUrl, '/service', keys<IService>())
    const client = createReduxClient(remoteClient, 'myService')

    // type R<T> = T extends (...args: any[]) => infer RV ? RV : never

    type Client = typeof client
    type ActionCreators = TActionCreators<typeof client>
    type AllActions = TAllActions<typeof client>

    function handleAction(state: any, action: AllActions) {
      if (action.type !== 'myService') {
        return
      }
      switch (action.method) {
        case 'add':
          switch (action.status) {
            case 'pending':
              const p1: Promise<number> = action.payload
              return
            case 'rejected':
              const p2: Error = action.payload
              return
            case 'resolved':
              const p3: number = action.payload
              return
          }
        case 'addAsync':
        // case 'addAsync1234':
        // case
      }
    }

    // type Values<T> = T[keyof T]
    // type C = ReturnType<Values<typeof client>>

    return client
  }

  describe('action creators', () => {
    describe('add', () => {
      it('creates a redux action with type, method and status', async () => {
        const client = getClient()
        const action = client.add(3, 7)
        expect(action.method).toEqual('add')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result = await action.payload
        expect(result).toEqual(3 + 7)
        // compilation test
        expect(result + 2).toEqual(12)
      })
    })
    describe('addAsync', () => {
      it('creates a redux action with type, method and status', async () => {
        const client = getClient()
        const action = client.addAsync(3, 7)
        expect(action.method).toEqual('addAsync')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result = await action.payload
        expect(result).toEqual(3 + 7)
        // compilation test
        expect(result + 2).toEqual(12)
      })
    })
    describe('addWithContext', () => {
      it('creates a redux action with type, method and status', async () => {
        const client = getClient()
        const action = client.addWithContext(3, 7)
        expect(action.method).toEqual('addWithContext')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result = await action.payload
        expect(result).toEqual(3 + 7 + 1000)
        // compilation test
        expect(result + 2).toEqual(1012)
      })
    })
    describe('addAsyncWithContext', () => {
      it('creates a redux action with type, method and status', async () => {
        const client = getClient()
        const action = client.addAsyncWithContext(3, 7)
        expect(action.method).toEqual('addAsyncWithContext')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result = await action.payload
        expect(result).toEqual(3 + 7 + 1000)
        // compilation test
        expect(result + 2).toEqual(1012)
      })
    })
  })

})
