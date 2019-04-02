import ExpressSession from 'express-session'
import {THandler} from './THandler'
import {IMiddleware} from './IMiddleware'
import {ISession} from '../session/ISession'
import {ITransactionManager} from '../database/ITransactionManager'
import {Session as SessionEntity} from '../entities/Session'
import {SessionStore} from '../session/SessionStore'
import {UrlWithStringQuery} from 'url'

export interface ISessionOptions {
  transactionManager: ITransactionManager,
  baseUrl: UrlWithStringQuery,
  sessionName: string,
  sessionSecret: string | string[],
}

export class SessionMiddleware implements IMiddleware {
  readonly handle: THandler

  constructor(readonly params: ISessionOptions) {
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
        cleanup: 1,
        getRepository: this.getRepository,
        ttl: 1,
        buildSession: this.buildSession,
      }),
    })
  }

  protected buildSession = (sessionData: Express.SessionData, sess: ISession)
  : SessionEntity => {
    return {...sess, userId: sessionData.userId }
  }

  protected getRepository = () => {
    return this.params.transactionManager.getRepository(SessionEntity)
  }
}
