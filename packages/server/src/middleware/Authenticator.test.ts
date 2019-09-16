import { AuthService, Credentials } from '@rondo.dev/common'
import { urlencoded } from 'body-parser'
import express, { Application } from 'express'
import request from 'supertest'
import { Authenticator } from './Authenticator'
import { handlePromise } from './handlePromise'

describe('Authenticator', () => {

  let app: Application
  let loginMiddleware: any
  beforeEach(() => {
    app = express()

    const userInfo = {
      username: `test${process.env.JEST_WORKER_ID}@user.com`,
      firstName: 'test',
      lastName: 'test',
    }
    const authService = new (class implements AuthService {
      async createUser() {
        return {id: 1, ...userInfo}
      }
      async changePassword() {/* empty */}
      async findOne(id: number) {
        return {id, ...userInfo}
      }
      async validateCredentials({username, password}: Credentials) {
        if (username === 'test' && password === 'pass') {
          return {id: 1, ...userInfo}
          return
        }
        if (username === 'error') {
          throw new Error('Test Error')
        }
        return undefined
      }
      async findUserByEmail(email: string) {
        return undefined
      }
    })()
    const authenticator = new Authenticator(authService)

    app.use(urlencoded({ extended: false }))
    app.use(authenticator.handle)

    loginMiddleware = handlePromise(async (req, res, next) => {
      const user = await authenticator.authenticate('local')(req, res, next)
      if (!user) {
        res.redirect('/failure')
        return
      }
      await req.logInPromise(user)
      res.redirect('/success')
    })
  })

  describe('success', () => {
    it('redirects to /success', async () => {
      app.post('/login', loginMiddleware)
      await request(app)
      .post('/login')
      .send('username=test&password=pass')
      .expect(302)
      .expect('location', '/success')
    })

    it('fails on error in authenticate', async () => {
      app.post('/login', loginMiddleware)
      await request(app)
      .post('/login')
      .send('username=error&password=pass')
      .expect(500)
      .expect(/Test Error/)
    })

    it('fails on error in logIn', async () => {
      app.use((req, res, next) => {
        req.logIn = jest.fn().mockImplementation((user, callback) => {
          callback(new Error('2nd Error'))
        })
        next()
      })
      app.post('/login', loginMiddleware)

      await request(app)
      .post('/login')
      .send('username=test&password=pass')
      .expect(500)
      .expect(/2nd Error/)
    })

  })

})
