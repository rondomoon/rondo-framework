import * as util from './bulk'
import express from 'express'
import {Contextual} from './types'
import {jsonrpc} from './express'
import {noopLogger} from './test-utils'
import {createClient} from './supertest'
import {json} from 'body-parser'

describe('util', () => {

  interface IS1 {
    add(a: number, b: number): number
  }

  interface IS2 {
    mul(a: number, b: number): number
    concat(...str: string[]): string
  }

  interface IContext {
    userId: number
  }

  class Service1 implements Contextual<IS1, IContext> {
    add(cx: IContext, a: number, b: number) {
      return a + b + cx.userId
    }
  }

  class Service2 implements Contextual<IS2, IContext> {
    mul(cx: IContext, a: number, b: number) {
      return a * b + cx.userId
    }
    concat(cx: IContext, ...str: string[]) {
      return str.join('') + cx.userId
    }
  }

  const services = {
    s1: new Service1(),
    s2: new Service2(),
  }

  describe('bulkCreateLocalClient', () => {
    it('creates a typed local client', async () => {
      const client = util.bulkCreateLocalClient(services, {userId: 10})

      const r1: number = await client.s1.add(1, 2)
      expect(r1).toBe(13)

      const r2: number = await client.s2.mul(2, 3)
      expect(r2).toBe(16)

      const r3: string = await client.s2.concat('a', 'b')
      expect(r3).toBe('ab10')
    })
  })

  describe('bulkCreateActions', () => {
    it('creates typed actions', async () => {
      const client = util.bulkCreateLocalClient(services, {userId: 10})
      const actions = util.bulkCreateActions(client)

      const r1 = actions.s1.add(1, 2)
      const method1: 'add' = r1.method
      const status1: 'pending' = r1.status
      const type1: 's1' = r1.type
      const payload1: Promise<number> = r1.payload
      expect(type1).toBe('s1')
      expect(status1).toBe('pending')
      expect(method1).toBe('add')
      expect(await payload1).toBe(13)

      const r2 = actions.s2.mul(2, 3)
      const method2: 'mul' = r2.method
      const status2: 'pending' = r2.status
      const type2: 's2' = r2.type
      const payload2: Promise<number> = r2.payload
      expect(type2).toBe('s2')
      expect(status2).toBe('pending')
      expect(method2).toBe('mul')
      expect(await payload2).toBe(16)
    })
  })

  describe('bulkJSONRPC', () => {
    const getContext = () => ({userId: 10})
    function createApp(router: express.Router) {
      const app = express()
      app.use(json())
      app.use('/rpc', router)
      return app
    }

    it('creates JSON RPC services', async () => {
      const router = util.bulkjsonrpc(
        jsonrpc(getContext, noopLogger),
        services,
      )
      const app = createApp(router)
      const client = createClient<IS1>(app, '/rpc/s1')
      const result: number = await client.add(1, 3)
      expect(result).toBe(14)
    })
  })

})