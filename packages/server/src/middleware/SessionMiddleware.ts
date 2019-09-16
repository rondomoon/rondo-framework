import ExpressSession from 'express-session'
import { UrlWithStringQuery } from 'url'
import { TransactionManager } from '../database'
import { Session as SessionEntity } from '../entities/Session'
import { apiLogger } from '../logger'
import { SessionStore } from '../session/SessionStore'
import { Handler } from './Handler'
import { Middleware } from './Middleware'
import { DefaultSession } from '../session'

export interface SessionMiddlewareParams {
  transactionManager: TransactionManager
  baseUrl: UrlWithStringQuery
  sessionName: string
  sessionSecret: string | string[]
}

export class SessionMiddleware implements Middleware {
  readonly handle: Handler

  constructor(readonly params: SessionMiddlewareParams) {
    this.handle = ExpressSession({
      saveUninitialized: false,
      secret: params.sessionSecret,
      resave: false,
      rolling: true,
      name: params.sessionName,
      cookie: {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: true,
        sameSite: true,
        secure: params.baseUrl.protocol === 'https',
        path: params.baseUrl.path,
      },
      store: new SessionStore({
        cleanupDelay: 60 * 1000,
        logger: apiLogger,
        getRepository: this.getRepository,
        ttl: 1,
        buildSession: this.buildSession,
      }),
    })
  }

  protected buildSession = (
    sessionData: Express.SessionData,
    sess: DefaultSession,
  ): SessionEntity => {
    return {...sess, userId: sessionData.userId }
  }

  protected getRepository = () => {
    return this.params.transactionManager.getRepository(SessionEntity)
  }
}
