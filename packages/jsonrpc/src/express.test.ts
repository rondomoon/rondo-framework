import bodyParser from 'body-parser'
import express from 'express'
import request from 'supertest'
import {IRequest} from './jsonrpc'
import {createClient} from './supertest'
import {ensure} from './ensure'
import {jsonrpc} from './express'
import {noopLogger} from './test-utils'
import {Contextual} from './types'

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

    addWithContext(a: number, b: number): number
    addWithContext2(a: number, b: number): Promise<number>
  }

  const ensureLoggedIn = ensure<IContext>(c => !!c.userId)

  class Service implements Contextual<IService, IContext> {
    constructor(readonly time: number) {}
    add(context: IContext, a: number, b: number) {
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
    syncError(context: IContext, message: string) {
      throw new Error(message)
    }
    async asyncError(context: IContext, message: string) {
      throw new Error(message)
    }
    async httpError(context: IContext, statusCode: number, message: string) {
      const err: any = new Error(message)
      err.statusCode = statusCode
      err.errors = [{
        message: 'one',
      }]
      throw err
    }
    addWithContext = (ctx: IContext, a: number, b: number) => {
      return a + b + ctx.userId
    }

    @ensureLoggedIn
    addWithContext2(ctx: IContext, a: number, b: number) {
      return Promise.resolve(a + b + ctx!.userId)
    }
  }

  let userId: number | undefined = 1000
  function createApp() {
    userId = 1000
    const app = express()
    app.use(bodyParser.json())
    app.use('/',
      jsonrpc(req => ({userId}), noopLogger)
      .addService('/myService', new Service(5), [
        'add',
        'delay',
        'syncError',
        'asyncError',
        'httpError',
        'addWithContext',
        'addWithContext2',
      ])
      .router(),
    )
    return app
  }

  const client = createClient<IService>(createApp(), '/myService')

  async function getError(promise: Promise<unknown>) {
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
      expect(response.body).toEqual({
        jsonrpc: '2.0',
        id: 1,
        result: null,
        error: {
          code: -32000,
          data: null,
          message: 'Server error',
        },
      })
    })
    it('handles async errors', async () => {
      const err = await getError(client.asyncError('test'))
      expect(err.message).toBe('Server error')
      expect(err.code).toBe(-32000)
    })
    it('returns an error when message is not readable', async () => {
      const result = await request(createApp())
      .post('/myService')
      .send('a=1')
      .expect(400)
      expect(result.body.error.message).toEqual('Invalid request')
    })
    it('returns an error when message is not valid', async () => {
      const result = await request(createApp())
      .post('/myService')
      .send({})
      .expect(400)
      expect(result.body.error.message).toEqual('Invalid request')
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
    it('can use context as extra argument', async () => {
      const response = await client.addWithContext2(5, 7)
      expect(response).toEqual(1000 + 5 + 7)
    })
    it('can validate context using @ensure decorator', async () => {
      userId = undefined
      const err = await getError(client.addWithContext2(5, 7))
      expect(err.message).toMatch(/Invalid request/)
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

    it('cannot call non-idempotent methods using GET request', async () => {
      const params = encodeURIComponent(JSON.stringify([1, 2]))
      await request(createApp())
      .get(`/myService?jsonrpc=2.0&id=1&method=add&params=${params}`)
      .expect(405)
    })

    describe('wrapCall', () => {

      let requests: IRequest[] = []
      let results: any[] = []
      function create() {
        requests = []
        results = []

        userId = 1000
        const app = express()
        const myService = new Service(5)
        // console.log('service', myService, Object.
        app.use(bodyParser.json())
        app.use('/',
          jsonrpc(
            req => ({userId}),
            noopLogger,
            async (path, req, makeRequest) => {
              requests.push(req)
              const result = await makeRequest()
              results.push(result)
              return result
            },
          )
          .addService('/myService', myService)
          .router(),
        )
        return app
      }

      it('should wrap POST rpc method call', async () => {
        const req = {
          jsonrpc: '2.0',
          id: 1,
          method: 'add',
          params: [1, 2],
        }
        const response = await request(create())
        .post('/myService')
        .send(req)

        expect(response.body.result).toEqual(3)
        expect(requests).toEqual([ req ])
        expect(results).toEqual([ response.body ])
      })

    })
  })

})
