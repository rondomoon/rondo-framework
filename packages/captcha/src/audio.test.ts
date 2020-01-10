import express from 'express'
import session from 'express-session'
import cookieParser from 'cookie-parser'
import request from 'supertest'
import { audio, speak } from './audio'
import { extname, join } from 'path'

describe('speak', () => {
  it('writes speech data to stdin and returns rw streams', async () => {
    async function read(readable: NodeJS.ReadableStream): Promise<string> {
      return new Promise((resolve, reject) => {
        readable.on('error', err => reject(err))
        readable.on('readable', () => {
          let data = ''
          let chunk
          while (null !== (chunk = readable.read())) {
            data += chunk
          }
          resolve(data)
        })
      })
    }

    const command = {
      cmd: process.argv[0],
      args: [join(__dirname, 'testProcess' + extname(__filename))],
      contentType: 'text/plain',
    }
    const rw = await speak('mytest', [command])
    const data = await read(rw.stdout)
    expect(data).toEqual('mytest')
  })
})

describe('audio', () => {

  const app = express()
  app.use(cookieParser())
  app.use(session({
    saveUninitialized: false,
    resave: false,
    secret: 'test',
  }))
  app.get('/captcha/audio', audio({
    commands: [{
      cmd: process.argv[0],
      args: [join(__dirname, 'testProces.ts')],
      contentType: 'text/plain',
    }],
    size: 6,
  }))
  app.get('/captcha/session', (req, res) => {
    res.json(req.session)
  })

  describe('/captcha/audio', () => {
    it('generates a new captcha', async () => {
      const res1 = await request(app)
      .get('/captcha/audio')
      .expect('Content-type', /text\/plain/)
      .expect(200)

      const cookie = res1.header['set-cookie'][0]

      const res2 = await request(app)
      .get('/captcha/session')
      .set('cookie', cookie)
      .expect(200)

      expect(res2.body.captcha).toEqual({
        value: jasmine.any(String),
        type: 'audio',
        timestamp: jasmine.any(Number),
      })
    })

    it('fails with error 500 when unable to generate', async () => {
      const app = express()
      app.use(cookieParser())
      app.use(session({
        saveUninitialized: false,
        resave: false,
        secret: 'test',
      }))
      app.get('/captcha/audio', audio({
        commands: [{
          cmd: 'non-existing-command',
          args: [],
          contentType: 'text/plain',
        }],
        size: 6,
      }))
      await request(app)
      .get('/captcha/audio')
      .expect(500)
      .expect('Internal server error')
    })
  })

})
