import bodyParser from 'body-parser'
import express from 'express'
import request from 'supertest'
import {Request} from './jsonrpc'
import {createClient} from './supertest'
import {ensure} from './ensure'
import {jsonrpc} from './express'
import {noopLogger} from './test-utils'
import {WithContext} from './types'

describe('jsonrpc', () => {

  interface Context {
    userId: number
  }

  interface Service {
    add(a: number, b: number): number
    delay(): Promise<void>
    syncError(message: string): void
    asyncError(message: string): Promise<void>
    httpError(statusCode: number, message: string): Promise<void>

    addWithContext(a: number, b: number): number
    addWithContext2(a: number, b: number): Promise<number>
  }

  const ensureLoggedIn = ensure<Context>(c => !!c.userId)

  @ensureLoggedIn
  class MyService implements WithContext<Service, Context> {
    constructor(readonly time: number) {}
    add(context: Context, a: number, b: number) {
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
    syncError(context: Context, message: string) {
      throw new Error(message)
    }
    async asyncError(context: Context, message: string) {
      throw new Error(message)
    }
    async httpError(context: Context, statusCode: number, message: string) {
      const err: any = new Error(message)
      err.statusCode = statusCode
      err.errors = [{
        message: 'one',
      }]
      throw err
    }
    addWithContext = (ctx: Context, a: number, b: number) => {
      return a + b + ctx.userId
    }
    _private = () => {
      return 1
    }
    @ensureLoggedIn
    addWithContext2(ctx: Context, a: number, b: number) {
      return Promise.resolve(a + b + ctx!.userId)
    }
  }

  let userId: number | undefined = 1000
  function createApp() {
    userId = 1000
    const app = express()
    app.use(bodyParser.json())
    app.use('/',
      jsonrpc(() => ({userId}), noopLogger)
      .addService('/app/myService', new MyService(5), [
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

  const client = createClient<Service>(createApp(), '/app/myService')

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
      .post('/app/myService')
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
      .post('/app/myService')
      .send('a=1')
      .expect(400)
      expect(result.body.error.message).toEqual('Invalid request')
    })
    it('returns an error when message is not valid', async () => {
      const result = await request(createApp())
      .post('/app/myService')
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
      .post('/app/myService')
      .send({
        jsonrpc: '2.0',
        method: 'add',
        params: [1, 2],
      })
      .expect(204)
      .expect('')

      await request(createApp())
      .post('/app/myService')
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

  describe('invalid requests', () => {
    it('returns 404 when invalid request method used', async () => {
      await request(createApp())
      .put('/app/myService')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: 'toString',
        params: [],
      })
      .expect(404)
    })

    it('returns 404 when service url is invalid', async () => {
      await request(createApp())
      .post('/app/nonExistingService')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: 'toString',
        params: [],
      })
      .expect(404)
    })
  })

  describe('multiple services', () => {
    interface S1 {
      add(a: number, b: number): number
    }
    class Test1 implements WithContext<S1, Context> {
      add(c: Context, a: number, b: number) {
        return a + b
      }
    }
    class Test2 implements WithContext<S1, Context> {
      add(c: Context, a: number, b: number): number {
        throw new Error('Not implemented')
      }
    }
    const app = express()
    app.use(bodyParser.json())
    app.get('/app/s3', (req, res) => {
      throw new Error('test s3')
    })
    app.use('/app',
      jsonrpc(() => ({userId: 1}), noopLogger)
      .addService('/s1', new Test1(), ['add'])
      .addService('/s2', new Test2(), ['add'])
      .router(),
    )

    it('invokes the first service', async () => {
      await request(app)
      .post('/app/s1')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: 'add',
        params: [1, 2],
      })
      .expect(200)
      .expect({
        jsonrpc: '2.0',
        id: 123,
        result: 3,
        error: null,
      })
    })

    it('invokes the second service', async () => {
      await request(app)
      .post('/app/s2')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: 'add',
        params: [1, 2],
      })
      .expect(500)
      .expect({
        jsonrpc: '2.0',
        id: 123,
        result: null,
        error: {
          code: -32000,
          message: 'Server error',
          data: null,
        },
      })
    })

    it('invokes the second service', async () => {
      await request(app)
      .get('/app/s3')
      .expect(500)
      .expect(/Error: test s3/)
    })
  })

  describe('security', () => {
    it('cannot call toString method', async () => {
      await request(createApp())
      .post('/app/myService')
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

    it('cannot call private _-prefixed methods', async () => {
      await request(createApp())
      .post('/app/myService')
      .send({
        id: 123,
        jsonrpc: '2.0',
        method: '_private',
        params: [],
      })
      .expect(404)
      .expect(/Method not found/)
    })

    it('cannot call any other methods in objects prototype', async () => {
      await request(createApp())
      .post('/app/myService')
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
      .get(`/app/myService?jsonrpc=2.0&id=1&method=add&params=${params}`)
      .expect(405)
    })

    describe('hook', () => {

      let requests: Request[] = []
      let results: any[] = []
      function create() {
        requests = []
        results = []

        userId = 1000
        const app = express()
        const myService = new MyService(5)
        app.use(bodyParser.json())
        app.use('/app',
          jsonrpc(
            () => Promise.resolve({userId}),
            noopLogger,
            async (details, makeRequest) => {
              requests.push(details.request)
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
        .post('/app/myService')
        .send(req)

        expect(response.body.result).toEqual(3)
        expect(requests).toEqual([ req ])
        expect(results).toEqual([ response.body ])
      })

    })
  })

})
