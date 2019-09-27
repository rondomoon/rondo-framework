import express from 'express'
import { expressify } from './expressify'
import request from 'supertest'
import { createMiddleware } from './createMiddleware'

describe('expressify', () => {

  describe('middleware', () => {
    it('acts as a middleware when returned value is undefined', async () => {
      const app = express()
      app.use(
        expressify(
          createMiddleware(ctx => (ctx.req as any).id = 'test')))
      app.get('/test', (req, res) => res.json({ id: (req as any).id }))
      await request(app)
      .get('/test')
      .expect(200)
      .expect('{"id":"test"}')
    })
  })

  describe('response', () => {
    it('sends a response', async () => {
      const app = express()
      app.use(
        expressify(
          createMiddleware(ctx => (ctx.req as any).id = 'test')))
      app.get('/test', expressify(ctx => (ctx.req as any).id))
      await request(app)
      .get('/test')
      .expect(200)
      .expect('"test"')
    })

    it('can send a response using a custom fn', async () => {
      const app = express()
      app.use(
        expressify(
          createMiddleware(ctx => (ctx.req as any).id = 'test')))
      app.get('/test',
        expressify(ctx => (ctx.req as any).id, (res, value) => res.send(value)))
      await request(app)
      .get('/test')
      .expect(200)
      .expect('test')
    })

    it('handles errors', async () => {
      const app = express()
      app.use(
        expressify(
          createMiddleware(ctx => { throw new Error('test') })))
      await request(app)
      .get('/test')
      .expect(500)
    })

    it('does not crash nor hang when middleware sends a response', async () => {
      const app = express()
      app.use(
        expressify(
          createMiddleware(ctx => ctx.res.end('test'))))
      await request(app)
      .get('/test')
      .expect(200)
      .expect('test')
    })

  })

})
