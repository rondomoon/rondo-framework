/**
 * @jest-environment node
 */

import bodyParser from 'body-parser'
import express from 'express'
import {AddressInfo} from 'net'
import {Server} from 'http'
import {TPendingActions, TAllActions} from './types'
import {createReduxClient, createReducer, createReducer2} from './redux'
import {createRemoteClient} from './remote'
import {createStore} from '@rondo/client'
import {jsonrpc} from './express'
import {keys} from 'ts-transformer-keys'

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
    type ActionCreators = TPendingActions<typeof client>
    type AllActions = TAllActions<typeof client>

    const defaultState = {
      loading: 0,
      error: '',
      add: 0,
      addStringsAsync: '',
    }

    const reducer = createReducer('myService', defaultState)
    <typeof client>((state, action) => {
      switch (action.method) {
        case 'add':
        case 'addAsync':
        case 'addWithContext':
        case 'addAsyncWithContext':
          const r1: number = action.payload
          return {
            ...state,
            add: r1,
          }
        case 'addStringsAsync':
          const r2: string = action.payload
          return {
            ...state,
            addStringsAsync: r2,
          }
        default:
          return state
      }
    })

    const reducer2 = createReducer2('myService', defaultState)
    <typeof client>({
      add(state, action) {
        const s: Partial<typeof defaultState> = {
          // a: 1,
          add: action.payload,
        }
        return s
      },
      addAsync(state, action) {
        return state
      },
      addAsyncWithContext(state, action) {
        return state
      },
      addStringsAsync(state, action) {
        return state
      },
      addWithContext(state, action) {
        return state
      },
    })

    const store = createStore({reducer})()

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

    return {client, store}
  }

  describe('action creators', () => {
    describe('add', () => {
      it('creates a redux action with type, method and status', async () => {
        const {client, store} = getClient()
        const action = client.add(3, 7)
        expect(action.method).toEqual('add')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result: number = await store.dispatch(action).payload
        expect(result).toEqual(3 + 7)
        expect(store.getState().add).toEqual(10)
      })
    })
    describe('addAsync', () => {
      it('creates a redux action with type, method and status', async () => {
        const {client, store} = getClient()
        const action = client.addAsync(3, 7)
        expect(action.method).toEqual('addAsync')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result: number = await store.dispatch(action).payload
        expect(result).toEqual(3 + 7)
        expect(store.getState().add).toEqual(10)
      })
    })
    describe('addWithContext', () => {
      it('creates a redux action with type, method and status', async () => {
        const {client, store} = getClient()
        const action = client.addWithContext(3, 7)
        expect(action.method).toEqual('addWithContext')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result: number = await store.dispatch(action).payload
        expect(result).toEqual(3 + 7 + 1000)
        expect(store.getState().add).toEqual(1010)
      })
    })
    describe('addAsyncWithContext', () => {
      it('creates a redux action with type, method and status', async () => {
        const {client, store} = getClient()
        const action = client.addAsyncWithContext(3, 7)
        expect(action.method).toEqual('addAsyncWithContext')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result: number = await store.dispatch(action).payload
        expect(result).toEqual(3 + 7 + 1000)
        expect(store.getState().add).toEqual(1010)
      })
    })
  })

})
