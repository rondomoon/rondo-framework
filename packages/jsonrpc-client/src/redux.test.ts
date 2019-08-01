/**
 * @jest-environment node
 */
import bodyParser from 'body-parser'
import express from 'express'
import {AddressInfo} from 'net'
import {Server} from 'http'
import {createReduxClient} from './redux'
import {createRemoteClient} from './remote'
import {jsonrpc} from '@rondo/jsonrpc-server'
import {keys} from 'ts-transformer-keys'

describe('createReduxClient', () => {

  interface IService {
    add(a: number, b: number): number
    addAsync(a: number, b: number): Promise<number>
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
    return createReduxClient(remoteClient, 'myService')
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
