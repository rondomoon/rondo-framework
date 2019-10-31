import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { image } from './image'

describe('image', () => {

  const app = express()
  app.use(cookieParser())
  app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'test',
  }))
  app.get('/captcha/image', image({ size: 6 }))
  app.get('/captcha/session', (req, res) => {
    res.json(req.session)
  })

  describe('/captcha/image', () => {
    it('generates a new captcha', async () => {
      const res1 = await request(app)
      .get('/captcha/image')
      .expect('Content-type', /svg/)
      .expect(200)

      const cookie = res1.header['set-cookie'][0]

      const res2 = await request(app)
      .get('/captcha/session')
      .set('cookie', cookie)
      .expect(200)

      expect(res2.body.captcha).toEqual(jasmine.any(String))
    })
  })

})
