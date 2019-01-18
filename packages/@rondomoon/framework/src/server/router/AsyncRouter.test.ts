import express from 'express'
import request from 'supertest'
import {AsyncRouter} from './AsyncRouter'

describe('AsyncRouter', () => {

  interface IResponse {
    value: string
  }

  interface IParam {
    param: string
  }

  interface IHandler {
    params: IParam,
    response: IResponse,
  }

  interface IMyApi {
    '/test/:param': {
      get: IHandler
      post: IHandler
      put: IHandler
      delete: IHandler
      options: IHandler
      patch: IHandler
      head: {},
    }
  }

  const app = express()
  const router = express.Router()
  app.use(router)
  const asyncRouter = new AsyncRouter<IMyApi>(router)

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

  it('creates its own router when not provided', () => {
    const r = new AsyncRouter<IMyApi>()
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
  })
})
