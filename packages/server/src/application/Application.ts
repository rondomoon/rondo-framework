import * as middleware from '../middleware'
import * as routes from '../routes'
import * as services from '../services'
import * as team from '../team'
import * as user from '../user'
import cookieParser from 'cookie-parser'
import express from 'express'
import {AsyncRouter, TransactionalRouter} from '../router'
import {DB} from '../database/DB'
import {IApplication} from './IApplication'
import {IConfig} from './IConfig'
import {IDatabase} from '../database/IDatabase'
import {ILogger} from '../logger/ILogger'
import {IRoutes} from '@rondo.dev/common'
import {IServices} from './IServices'
import {ITransactionManager} from '../database/ITransactionManager'
import {loggerFactory, LoggerFactory} from '../logger/LoggerFactory'
import {json} from 'body-parser'

export class Application implements IApplication {
  readonly db: DB
  readonly transactionManager: ITransactionManager
  readonly server: express.Application

  readonly services: IServices
  readonly authenticator: middleware.Authenticator

  readonly loggerFactory: LoggerFactory = loggerFactory

  constructor(readonly config: IConfig, readonly database: IDatabase) {
    this.transactionManager = database.transactionManager
    this.db = new DB(this.transactionManager)

    this.services = this.configureServices()

    this.authenticator = new middleware.Authenticator(this.services.userService)

    this.server = this.createServer()
  }

  protected configureServices(): IServices {
    return {
      userService: new services.UserService(this.db),
      teamService: new team.TeamService(this.db),
      userPermissions: new user.UserPermissions(this.db),
    }
  }

  protected getApiLogger(): ILogger {
    return this.loggerFactory.getLogger('api')
  }

  protected createServer() {
    const server = express()
    server.set('trust proxy', 1)
    server.disable('x-powered-by')

    const router = express.Router()

    this.configureMiddleware(router)
    this.configureRouter(router)
    this.configureApiErrorHandling(router)
    this.configureFrontend(router)

    server.use(this.config.app.context, router)
    this.configureGlobalErrorHandling(server)
    return server
  }

  protected configureMiddleware(router: express.Router) {
    const {transactionManager} = this
    const apiLogger = this.getApiLogger()

    router.use(new middleware.SessionMiddleware({
      transactionManager,
      baseUrl: this.config.app.baseUrl,
      sessionName: this.config.app.session.name,
      sessionSecret: this.config.app.session.secret,
    }).handle)
    router.use(new middleware.RequestLogger(apiLogger).handle)
    router.use(json())
    router.use(cookieParser(this.config.app.session.secret))
    router.use(new middleware.CSRFMiddleware({
      baseUrl: this.config.app.baseUrl,
      cookieName: this.config.app.session.name + '_csrf',
    }).handle)
    router.use(new middleware.Transaction(this.database.namespace).handle)

    router.use(this.authenticator.handle)
  }

  protected configureRouter(router: express.Router) {
    // TODO use /api for LoginRoutes
    router.use('/app', routes.application)

    router.use('/api', new routes.LoginRoutes(
      this.services.userService,
      this.authenticator,
      this.createTransactionalRouter(),
    ).handle)
    router.use('/api', new routes.UserRoutes(
      this.services.userService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new team.TeamRoutes(
      this.services.teamService,
      this.services.userPermissions,
      this.createTransactionalRouter(),
    ).handle)
  }

  protected configureApiErrorHandling(router: express.Router) {
    const apiLogger = this.getApiLogger()
    router.use('/api', new middleware.ErrorApiHandler(apiLogger).handle)
  }

  protected configureFrontend(router: express.Router) {
    // Override this method
  }

  protected configureGlobalErrorHandling(server: express.Application) {
    const apiLogger = this.getApiLogger()
    server.use(new middleware.ErrorPageHandler(apiLogger).handle)
  }

  createAsyncRouter<T extends IRoutes>(): AsyncRouter<T> {
    return new AsyncRouter<T>()
  }

  createTransactionalRouter<T extends IRoutes>(): AsyncRouter<T> {
    return new TransactionalRouter<T>(this.transactionManager)
  }
}
