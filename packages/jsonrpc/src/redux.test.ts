/**
 * @jest-environment node
 */

import { createStore } from '@rondo.dev/redux'
import bodyParser from 'body-parser'
import express from 'express'
import { Server } from 'http'
import { AddressInfo } from 'net'
import { combineReducers } from 'redux'
import { keys } from 'ts-transformer-keys'
import { jsonrpc } from './express'
import { createActions, createReducer } from './redux'
import { createRemoteClient } from './remote'
import { noopLogger } from './test-utils'
import { WithContext } from './types'

describe('createActions', () => {

  interface Service {
    add(a: number, b: number): number
    addAsync(a: number, b: number): Promise<number>
    addStringsAsync(a: string, b: string): Promise<string>
    addWithContext(a: number, b: number): number
    addAsyncWithContext(a: number, b: number): Promise<number>
    throwError(bool: boolean): boolean
  }

  interface Context {
    userId: number
  }

  class MyService implements WithContext<Service, Context> {
    add(cx: Context, a: number, b: number) {
      return a + b
    }
    addAsync(cx: Context, a: number, b: number) {
      return new Promise<number>(resolve => resolve(a + b))
    }
    addStringsAsync(cx: Context, a: string, b: string) {
      return new Promise<string>(resolve => resolve(a + b))
    }
    addWithContext = (cx: Context, a: number, b: number) =>
      a + b + cx.userId
    addAsyncWithContext = (cx: Context, a: number, b: number) =>
      new Promise<number>(resolve => resolve(a + b + cx.userId))
    throwError(cx: Context, bool: boolean) {
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
    .addService('/service', new MyService(), keys<Service>())
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
    const remoteClient = createRemoteClient<Service>(
      baseUrl + '/service', keys<Service>())
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
          return {
            ...state,
            add: action.payload,
          }
        case 'addStringsAsync':
          return {
            ...state,
            addStringsAsync: action.payload,
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
      throwError(state) {
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
        expect(store.getState().mapping.error).toMatch(/status code 500/)
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
