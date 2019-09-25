import { json } from 'body-parser'
import express from 'express'
import { RequestHandlerParams } from 'express-serve-static-core'
import * as util from './bulk'
import { jsonrpc } from './express'
import { createClient } from './supertest'
import { noopLogger } from './test-utils'
import { WithContext } from './types'

describe('util', () => {

  interface S1 {
    add(a: number, b: number): number
  }

  interface S2 {
    mul(a: number, b: number): number
    concat(...str: string[]): string
  }

  interface Context {
    userId: number
  }

  class Service1 implements WithContext<S1, Context> {
    add(cx: Context, a: number, b: number) {
      return a + b + cx.userId
    }
  }

  class Service2 implements WithContext<S2, Context> {
    mul(cx: Context, a: number, b: number) {
      return a * b + cx.userId
    }
    concat(cx: Context, ...str: string[]) {
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
    function createApp(router: RequestHandlerParams) {
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
      const client = createClient<S1>(app, '/rpc/s1')
      const result: number = await client.add(1, 3)
      expect(result).toBe(14)
    })
  })

})
