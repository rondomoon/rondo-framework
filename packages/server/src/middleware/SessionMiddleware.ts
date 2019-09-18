import { Session } from '@rondo.dev/common'
import { TypeORMTransactionManager } from '@rondo.dev/db-typeorm'
import ExpressSession from 'express-session'
import { UrlWithStringQuery } from 'url'
import { SessionEntity } from '../entity-schemas'
import { apiLogger } from '../logger'
import { DefaultSession } from '../session'
import { SessionStore } from '../session/SessionStore'
import { Handler } from './Handler'
import { Middleware } from './Middleware'

export interface SessionMiddlewareParams {
  transactionManager: TypeORMTransactionManager
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
  ): Session => {
    return {...sess, userId: sessionData.userId }
  }

  protected getRepository = () => {
    return this.params.transactionManager.getRepository(SessionEntity)
  }
}
