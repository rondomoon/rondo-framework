import express from 'express'
import request from 'supertest'
import {AsyncRouter} from './AsyncRouter'

describe('AsyncRouter', () => {

  interface Response {
    value: string
  }

  interface Param {
    param: string
  }

  interface Handler {
    params: Param
    response: Response
  }

  interface MyApi {
    '/test/:param': {
      get: Handler
      post: Handler
      put: Handler
      delete: Handler
      options: Handler
      patch: Handler
      head: {}
    }
    '/middleware': {
      get: {
        response: Response
      }
    }
  }

  const app = express()
  const router = express.Router()
  app.use(router)
  const asyncRouter = new AsyncRouter<MyApi>(router)

  asyncRouter.get('/test/:param', async req => {
    return {value: req.params.param}
  })
  asyncRouter.post('/test/:param', async req => {
    return {value: req.params.param}
  })
  asyncRouter.put('/test/:param', async req => {
    return {value: req.params.param}
  })
  asyncRouter.delete('/test/:param', async req => {
    return {value: req.params.param}
  })
  asyncRouter.options('/test/:param', async req => {
    return {value: req.params.param}
  })
  asyncRouter.patch('/test/:param', async req => {
    throw new Error('test')
  })
  asyncRouter.head('/test/:param', async req => {
    return ''
  })
  asyncRouter.get('/middleware', [(req, res, next) => {
    (req as any).testParam = 'middle'
    next()
  }, (req, res, next) => {
     (req as any).testParam += 'ware'
     next()
  }], async req => {
    const value = (req as any).testParam as string
    return {value}
  })

  it('creates its own router when not provided', () => {
    const r = new AsyncRouter<MyApi>()
    expect(r.router).toBeTruthy()
  })

  it('should work and handle errors', async () => {
    await request(app).get('/test/a').expect(200).expect('{"value":"a"}')
    await request(app).post('/test/a').expect(200).expect('{"value":"a"}')
    await request(app).put('/test/a').expect(200).expect('{"value":"a"}')
    await request(app).delete('/test/a').expect(200).expect('{"value":"a"}')
    await request(app).options('/test/a').expect(200).expect('{"value":"a"}')
    await request(app).patch('/test/a').expect(500)
    await request(app).head('/test/a').expect(200)
    await request(app).get('/middleware').expect(200)
    .expect('{"value":"middleware"}')
  })
})
