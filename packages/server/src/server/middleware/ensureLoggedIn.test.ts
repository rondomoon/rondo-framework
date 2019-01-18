import {ensureLoggedInApi, ensureLoggedInSite} from './ensureLoggedIn'
import express, {
  Application, Request, Response, NextFunction as Next,
} from 'express'
import request from 'supertest'

function createMockUserMiddleware() {
  const context: {user?: any} = {}
  function middleware(req: Request, res: Response, next: Next) {
    (req as any).user = context.user
    next()
  }
  return {context, middleware}
}

describe('user login', () => {

  const {context, middleware} = createMockUserMiddleware()

  let app: Application
  beforeEach(() => {
    context.user = null
    app = express()
    app.use('/', middleware)

    app.use('/api', ensureLoggedInApi)
    app.get('/api', (req, res) => res.json({status: 'ok'}))

    app.use('/app', ensureLoggedInSite('/login'))
    app.get('/app', (req, res) => res.end('ok'))
  })

  describe('userLoggedInApi', () => {

    it('should result in 401 when user not logged in', async () => {
      await request(app)
      .get('/api')
      .expect(401)
    })

    it('should result in 200 when user logged in', async () => {
      context.user = {}
      await request(app)
      .get('/api')
      .expect(200)
    })

  })

  describe('userLoggedInSite', () => {

    it('should result in redirect when user not logged in', async () => {
      await request(app)
      .get('/app')
      .expect(302)
      .expect('Location', '/login')
    })

    it('should result in 200 when user logged in', async () => {
      context.user = {}
      await request(app)
      .get('/app')
      .expect(200)
    })

  })

})
