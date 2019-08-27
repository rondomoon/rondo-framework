import express, {Application} from 'express'
import request from 'supertest'
import {SessionStore} from './SessionStore'
import {ISession} from './ISession'
import ExpressSession from 'express-session'
import loggerFactory from '@rondo.dev/logger'
import {
  createConnection, Column, Connection, Entity, Index, PrimaryColumn,
  Repository,
} from 'typeorm'

@Entity()
class Session implements ISession {
  @PrimaryColumn()
  id!: string

  @Column()
  json!: string

  @Column()
  extraData!: string

  @Column()
  @Index()
  expiredAt: number = Date.now()
}

describe('SessionStore', () => {

  let connection!: Connection
  let repository!: Repository<Session>
  beforeEach(async () => {
    connection = await createConnection({
      type: 'sqlite',
      database: ':memory:',
      entities: [Session],
      synchronize: true,
    })
    repository = connection.getRepository(Session)
  })

  afterEach(() => connection!.close())

  function createApp(maxAge = 10) {
    const app = express()
    app.use(ExpressSession({
      saveUninitialized: false,
      secret: 'test',
      resave: false,
      rolling: true,
      cookie: {
        maxAge: 10,
      },
      store: new SessionStore({
        logger: loggerFactory.getLogger('api'),
        cleanupDelay: 60 * 1000,
        getRepository: () => repository,
        ttl: 1,
        buildSession: (sd, s) => ({...s, extraData: 'test'}),
      }),
    }))

    app.post('/session/:param',
      (req, res, next) => {
        req.session!.param = req.params.param
        req.session!.save(next)
      },
      (req, res) => res.json({
        param: req.session!.param,
      }),
    )

    app.get('/session', (req, res) => res.json({
      param: req.session!.param,
    }))

    app.delete('/session',
      (req, res, next) => req.session!.destroy(next),
      (req, res) => res.end(),
    )

    return app
  }

  async function saveSession(app: Application) {
    return await request(app)
    .post('/session/value')
    .expect(200)
  }

  function getSession(app: Application, cookie: string = '') {
    return request(app)
    .get('/session')
    .set('cookie', cookie)
    .expect(200)
  }

  describe('save session', () => {
    it('saves a session to the database', async () => {
      const app = createApp()
      const response = await saveSession(app)

      const param = response.body.param
      expect(param).toEqual('value')

      const result = await repository.findOne(response.body.sid)
      expect(result).toBeTruthy()
      const payload = JSON.parse(result!.json)
      expect(payload.param).toEqual('value')
    })
  })

  describe('retrieve session', () => {
    it('retrieves a saved session via cookie', async () => {
      const app = createApp()
      const response = await saveSession(app)
      const cookie = response.header['set-cookie']
      expect(cookie).toBeTruthy()

      await getSession(app)
      .expect('{}')

      await getSession(app, cookie)
      .expect('{"param":"value"}')
    })
  })

  describe('destroy session', () => {
    it('destroys a saved session', async () => {
      const app = createApp()
      const response = await saveSession(app)
      const cookie = response.header['set-cookie']
      expect(cookie).toBeTruthy()

      await request(app)
      .delete('/session')
      .set('cookie', cookie)

      await getSession(app, cookie)
      .expect('{}')
    })
  })

  describe('error handling', () => {
    it('handles errors', async () => {
      (repository as any).save = () => Promise.reject(new Error('test'))
      const app = createApp()
      return await request(app)
      .post('/session/value')
      .expect(500)
    })
  })

})
