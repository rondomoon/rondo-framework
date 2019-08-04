/**
 * @jest-environment node
 */

import bodyParser from 'body-parser'
import express from 'express'
import {AddressInfo} from 'net'
import {Server} from 'http'
import {createRemoteClient} from './remote'
import {jsonrpc} from './express'
import {keys} from 'ts-transformer-keys'
import {noopLogger} from './test-utils'

describe('remote', () => {

  interface IService {
    add(a: number, b: number): number
    fetchItem(id: number): Promise<string>
  }
  const IServiceKeys = keys<IService>()

  class Service implements IService {
    add(a: number, b: number) {
      return a + b
    }
    async fetchItem(id: number): Promise<string> {
      return Promise.resolve('id:' + id)
    }
  }

  const service = new Service()

  function createApp() {
    const a = express()
    a.use(bodyParser.json())
    a.use('/myService', jsonrpc(() => ({}), noopLogger)
      .addService(service, IServiceKeys))
    return a
  }

  const app = createApp()

  let server: Server
  let baseUrl: string
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

  describe('idempotent method invocation (GET)', () => {
    it('creates a proxy for remote service', async () => {
      const rpc = createRemoteClient<IService>(
        baseUrl, '/myService', IServiceKeys)
      const result = await rpc.fetchItem(5)
      expect(result).toBe('id:5')
    })
  })

  describe('method invocation (POST)', () => {
    it('creates a proxy for remote service', async () => {
      const rpc = createRemoteClient<IService>(
        baseUrl, '/myService', IServiceKeys)
      const result = await rpc.add(3, 7)
      expect(result).toBe(3 + 7)
    })
  })
})
