import bodyParser from 'body-parser'
import express from 'express'
import request from 'supertest'
import {createClient} from './supertest'
import {jsonrpc} from './express'

describe('jsonrpc', () => {

  interface IContext {
    userId: number
  }

  interface IService {
    add(a: number, b: number): number
    delay(): Promise<void>
    syncError(message: string): void
    asyncError(message: string): Promise<void>
    httpError(statusCode: number, message: string): Promise<void>

    addWithContext(a: number, b: number): (ctx: IContext) => number
  }

  class Service implements IService {
    constructor(readonly time: number) {}
    add(a: number, b: number) {
      return a + b
    }
    multiply(...numbers: number[]) {
      return numbers.reduce((a, b) => a * b, 1)
    }
    delay(): Promise<void> {
      return new Promise(resolve => {
        setTimeout(resolve, this.time)
      })
    }
    syncError(message: string) {
      throw new Error(message)
    }
    async asyncError(message: string) {
      throw new Error(message)
    }
    async httpError(statusCode: number, message: string) {
      const err: any = new Error(message)
      err.statusCode = statusCode
      err.errors = [{
        message: 'one',
      }]
      throw err
    }
    addWithContext = (a: number, b: number) => (ctx: IContext): number => {
      return a + b + ctx.userId
    }
  }

  function createApp() {
    const app = express()
    app.use(bodyParser.json())
    app.use('/myService', jsonrpc(new Service(5), [
      'add',
      'delay',
      'syncError',
      'asyncError',
      'httpError',
      'addWithContext',
    ], req => ({userId: 1000})))
    return app
  }

  const client = createClient<IService>(createApp(), '/myService')

  async function getError(promise: Promise<void>) {
    let error
    try {
      await promise
    } catch (err) {
      error = err
    }
    expect(error).toBeTruthy()
    return error
  }

  describe('errors', () => {
    it('handles sync errors', async () => {
      const response = await request(createApp())
      .post('/myService')
      .send({
        id: 1,
        jsonrpc: '2.0',
        method: 'syncError',
        params: ['test'],
      })
      .expect(500)
      expect(response.body.id).toEqual(1)
      expect(response.body).toEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
        error: {
          code: -32000,
          message: 'Server error',
        },
      })
    })
    it('handles async errors', async () => {
      const err = await getError(client.asyncError('test'))
      expect(err.message).toBe('Server error')
      expect(err.code).toBe(-32000)
    })
    it('returns an error when message is not in json format', async () => {
      const result = await request(createApp())
      .post('/myService')
      .send('a=1')
      .expect(400)
      expect(result.body.error.message).toEqual('Parse error')
    })
    it('returns an error when message is not valid', async () => {
      const result = await request(createApp())
      .post('/myService')
      .send({})
      .expect(400)
      expect(result.body.error.message).toEqual('Invalid Request')
    })
    it('converts http errors into jsonrpc errors', async () => {
      const err = await getError(client.httpError(403, 'Unauthorized'))
      expect(err.message).toEqual('Unauthorized')
    })
  })

  describe('success', () => {
    it('can call method and receive results', async () => {
      const result = await client.add(3, 4)
      expect(result).toEqual(3 + 4)
    })
    it('handles promises', async () => {
      const response = await client.delay()
      expect(response).toEqual(undefined)
    })
    it('can use context', async () => {
      const response = await client.addWithContext(5, 7)
      expect(response).toEqual(1000 + 5 + 7)
    })
    it('handles synchronous notifications', async () => {
      await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        method: 'add',
        params: [1, 2],
      })
      .expect(204)
      .expect('')

      await request(createApp())
      .post('/myService')
      .send({
        jsonrpc: '2.0',
        id: null,
        method: 'add',
        params: [1, 2],
      })
      .expect(204)
      .expect('')
    })
  })

  describe('security', () => {
    it('cannot call toString method', async () => {
      await request(createApp())
      .post('/myService')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: 'toString',
        params: [],
      })
      .expect(404)
      .expect({
        jsonrpc: '2.0',
        id: 123,
        result: null,
        error: {
          code: -32601,
          message: 'Method not found',
          data: null,
        },
      })
    })

    it('cannot call any other methods in objects prototype', async () => {
      await request(createApp())
      .post('/myService')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: '__defineGetter__',
        params: [],
      })
      .expect(404)
      .expect({
        jsonrpc: '2.0',
        id: 123,
        result: null,
        error: {
          code: -32601,
          message: 'Method not found',
          data: null,
        },
      })
    })
  })

})