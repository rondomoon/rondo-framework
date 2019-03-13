import * as middleware from '../middleware'
import * as routes from '../routes'
import * as services from '../services'
import * as team from '../team'
import * as user from '../user'
import express from 'express'
import {AsyncRouter, TransactionalRouter} from '../router'
import {IApplication} from './IApplication'
import {IConfig} from './IConfig'
import {IDatabase} from '../database/IDatabase'
import {ILogger} from '../logger/ILogger'
import {IRoutes} from '@rondo/common'
import {ITransactionManager} from '../database/ITransactionManager'
import {loggerFactory, LoggerFactory} from '../logger/LoggerFactory'
import {urlencoded, json} from 'body-parser'

export class Application implements IApplication {
  readonly transactionManager: ITransactionManager
  readonly server: express.Application

  readonly userService: services.IUserService
  readonly teamService: team.ITeamService
  readonly userPermissions: user.IUserPermissions

  readonly authenticator: middleware.Authenticator

  readonly loggerFactory: LoggerFactory = loggerFactory

  constructor(readonly config: IConfig, readonly database: IDatabase) {
    this.transactionManager = database.transactionManager
    this.userService = new services.UserService(this.transactionManager)

    this.teamService = new team.TeamService(this.transactionManager)
    this.userPermissions = new user.UserPermissions(this.transactionManager)

    this.authenticator = new middleware.Authenticator(this.userService)

    this.server = this.createServer()
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

    server.use(this.config.app.context, router)
    this.configureGlobalErrorHandling(server)
    return server
  }

  protected configureMiddleware(router: express.Router) {
    const {transactionManager} = this
    const apiLogger = this.getApiLogger()

    router.use('/app', urlencoded({ extended: false }))

    router.use(new middleware.SessionMiddleware({
      transactionManager,
      baseUrl: this.config.app.baseUrl,
      sessionName: this.config.app.session.name,
      sessionSecret: this.config.app.session.secret,
    }).handle)
    router.use(middleware.csrf)
    router.use(new middleware.Transaction(this.database.namespace).handle)
    router.use(new middleware.RequestLogger(apiLogger).handle)

    router.use(this.authenticator.handle)
  }

  protected configureRouter(router: express.Router) {
    router.use('/app', new routes.LoginRoutes(
      this.userService,
      this.authenticator,
      this.createTransactionalRouter(),
    ).handle)
    router.use('/app', routes.application)

    router.use('/api', json())

    router.use('/api', new routes.UserRoutes(
      this.userService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new team.TeamRoutes(
      this.teamService,
      this.userPermissions,
      this.createTransactionalRouter(),
    ).handle)
  }

  protected configureApiErrorHandling(router: express.Router) {
    const apiLogger = this.getApiLogger()
    router.use('/api', new middleware.ErrorApiHandler(apiLogger).handle)
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
