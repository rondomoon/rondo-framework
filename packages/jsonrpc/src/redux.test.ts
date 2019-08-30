/**
 * @jest-environment node
 */

import bodyParser from 'body-parser'
import express from 'express'
import {AddressInfo} from 'net'
import {Server} from 'http'
import {Contextual, TPendingActions, TAllActions} from './types'
import {combineReducers} from 'redux'
import {createActions, createReducer} from './redux'
import {createRemoteClient} from './remote'
import {createStore} from '@rondo.dev/client'
import {jsonrpc} from './express'
import {keys} from 'ts-transformer-keys'
import {noopLogger} from './test-utils'

describe('createActions', () => {

  interface IService {
    add(a: number, b: number): number
    addAsync(a: number, b: number): Promise<number>
    addStringsAsync(a: string, b: string): Promise<string>
    addWithContext(a: number, b: number): number
    addAsyncWithContext(a: number, b: number): Promise<number>
    throwError(bool: boolean): boolean
  }

  interface IContext {
    userId: number
  }

  class Service implements Contextual<IService, IContext> {
    add(cx: IContext, a: number, b: number) {
      return a + b
    }
    addAsync(cx: IContext, a: number, b: number) {
      return new Promise<number>(resolve => resolve(a + b))
    }
    addStringsAsync(cx: IContext, a: string, b: string) {
      return new Promise<string>(resolve => resolve(a + b))
    }
    addWithContext = (cx: IContext, a: number, b: number) =>
      a + b + cx.userId
    addAsyncWithContext = (cx: IContext, a: number, b: number) =>
      new Promise<number>(resolve => resolve(a + b + cx.userId))
    throwError(cx: IContext, bool: boolean) {
      if (bool) {
        throw new Error('test')
      }
      return false
    }
  }

  const app = express()
  app.use(bodyParser.json())
  app.use(
    '/',
    jsonrpc(() => ({userId: 1000}), noopLogger)
    .addService('/service', new Service(), keys<IService>())
    .router(),
  )

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
      baseUrl + '/service', keys<IService>())
    const client = createActions(remoteClient, 'myService')

    const defaultState = {
      loading: 0,
      error: '',
      add: 0,
      addStringsAsync: '',
    }

    const handler = createReducer('myService', defaultState)
    .withHandler<typeof client>((state, action) => {
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

    const mapping = createReducer('myService', defaultState)
    .withMapping<typeof client>({
      add(state, action) {
        return {
          add: action.payload,
        }
      },
      addAsync(state, action) {
        return {
          add: action.payload,
        }
      },
      addAsyncWithContext(state, action) {
        return {
          add: action.payload,
        }
      },
      addStringsAsync(state, action) {
        return {
          addStringsAsync: action.payload,
        }
      },
      addWithContext(state, action) {
        return {
          add: action.payload,
        }
      },
      throwError(state, action) {
        return state
      },
    })

    const reducer = combineReducers({handler, mapping})
    const store = createStore({reducer})()

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
        expect(store.getState().handler.add).toEqual(10)
        expect(store.getState().mapping.add).toEqual(10)
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
        expect(store.getState().handler.add).toEqual(10)
        expect(store.getState().mapping.add).toEqual(10)
      })
    })
    describe('addStringsAsync', () => {
      it('creates a redux action with type, method and status', async () => {
        const {client, store} = getClient()
        const action = client.addStringsAsync('a', 'b')
        expect(action.method).toEqual('addStringsAsync')
        expect(action.type).toEqual('myService')
        expect(action.status).toEqual('pending')
        const result: string = await store.dispatch(action).payload
        expect(result).toEqual('ab')
        expect(store.getState().handler.addStringsAsync).toEqual('ab')
        expect(store.getState().mapping.addStringsAsync).toEqual('ab')
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
        expect(store.getState().handler.add).toEqual(1010)
        expect(store.getState().mapping.add).toEqual(1010)
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
        expect(store.getState().handler.add).toEqual(1010)
        expect(store.getState().mapping.add).toEqual(1010)
      })
    })
    describe('throwError', () => {
      it('handles errors', async () => {
        const {client, store} = getClient()
        const {payload} = store.dispatch(client.throwError(true))
        let error: Error
        try {
          await payload
        } catch (err) {
          error = err
        }
        expect(error!).toBeTruthy()
        expect(store.getState().handler.error).toMatch(/status code 500/)
      })
    })
    describe('action with missing method', () => {
      it('does not fail when action not defined', () => {
        const {store} = getClient()
        store.dispatch({
          type: 'myService',
          method: 'missingMethod',
          status: 'resolved',
          payload: null,
        })
      })
    })
  })

})
