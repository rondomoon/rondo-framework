import * as middleware from '../middleware'
import * as routes from '../routes'
import * as rpc from '../rpc'
import * as services from '../services'
import * as team from '../team'
import * as user from '../user'
import cookieParser from 'cookie-parser'
import express from 'express'
import {keys} from 'ts-transformer-keys'
import {AsyncRouter, TransactionalRouter} from '../router'
import {IApplication} from './IApplication'
import {IConfig} from './IConfig'
import {IDatabase} from '../database/IDatabase'
import {ILogger} from '../logger/ILogger'
import {IRoutes, IContext} from '@rondo.dev/common'
import {IServices} from './IServices'
import {ITransactionManager} from '../database/ITransactionManager'
import {loggerFactory} from '../logger'
import {ILoggerFactory} from '@rondo.dev/logger'
import {json} from 'body-parser'
import {jsonrpc} from '@rondo.dev/jsonrpc'

export class Application implements IApplication {
  readonly transactionManager: ITransactionManager
  readonly server: express.Application

  readonly services: IServices
  readonly authenticator: middleware.Authenticator

  readonly loggerFactory: ILoggerFactory = loggerFactory

  constructor(readonly config: IConfig, readonly database: IDatabase) {
    this.transactionManager = database.transactionManager

    this.services = this.configureServices()

    this.authenticator = new middleware.Authenticator(this.services.userService)

    this.server = this.createServer()
  }

  protected configureServices(): IServices {
    return {
      userService: new services.UserService(this.database),
      teamService: new team.TeamService(this.database),
      userPermissions: new user.UserPermissions(this.database),
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
    this.configureRPC(router)
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

  protected getContext(req: express.Request): IContext {
    return {user: req.user}
  }

  protected jsonrpc() {
    return jsonrpc(
      req => this.getContext(req),
      this.getApiLogger(),
      (path, service, callback) => this
      .database
      .transactionManager
      .doInNewTransaction(() => callback()),
    )
  }

  protected configureRPC(router: express.Router) {
    // Override this method
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
