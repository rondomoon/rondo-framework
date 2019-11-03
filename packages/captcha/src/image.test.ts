import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import express from 'express'
import session from 'express-session'
import request from 'supertest'
import { Captcha } from './Captcha'
import { image } from './image'
import { validateCaptcha } from './validateCaptcha'

describe('image', () => {

  const app = express()
  app.use(cookieParser())
  app.use(bodyParser.json())
  app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'test',
  }))
  app.get('/captcha/image', image({ size: 6 }))
  app.get('/captcha/session', (req, res) => {
    res.json(req.session)
  })
  app.post('/captcha/validate', validateCaptcha(), (req, res) => {
    res.send('OK')
  })
  app.post('/captcha/validate/expired', validateCaptcha({
    property: 'c',
    ttl: -1,
  }), (req, res) => {
    res.send('OK')
  })

  async function getImage() {
    const res = await request(app)
    .get('/captcha/image')
    .expect('Content-type', /svg/)
    .expect(200)

    return res.header['set-cookie'][0]
  }

  async function getCaptcha() {
    const cookie = await getImage()
    const res = await request(app)
    .get('/captcha/session')
    .set('cookie', cookie)
    .expect(200)

    return {captcha: res.body.captcha as Captcha, cookie}
  }

  describe('/captcha/image', () => {
    it('generates a new captcha', async () => {
      const { captcha } = await getCaptcha()
      expect(captcha).toEqual({
        value: jasmine.any(String),
        type: 'image',
        timestamp: jasmine.any(Number),
      })
    })
  })

  describe('/captcha/validate', () => {
    it('fails when no captcha in session', async () => {
      await request(app)
      .post('/captcha/validate')
      .send({ captcha: '123' })
      .expect(403)
    })
    it('fails when captcha is expired', async () => {
      const { captcha, cookie } = await getCaptcha()
      await request(app)
      .post('/captcha/validate/expired')
      .send({ captcha: captcha.value })
      .set('cookie', cookie)
      .expect(403)
    })
    it('fails when captcha does not match', async () => {
      const { cookie } = await getCaptcha()
      await request(app)
      .post('/captcha/validate')
      .set('cookie', cookie)
      .send({ captcha: 'invalid-captcha' })
      .expect(403)
    })
    it('validates captcha', async () => {
      const { captcha, cookie } = await getCaptcha()
      await request(app)
      .post('/captcha/validate')
      .set('cookie', cookie)
      .send({ captcha: captcha.value })
      .expect(200)
      .expect('OK')
    })
    it('cannot validate same captcha twice', async () => {
      const { captcha, cookie } = await getCaptcha()
      await request(app)
      .post('/captcha/validate')
      .set('cookie', cookie)
      .send({ captcha: captcha.value })
      .expect(200)
      .expect('OK')

      await request(app)
      .post('/captcha/validate')
      .set('cookie', cookie)
      .send({ captcha: captcha.value })
      .expect(403)
    })
  })

})
