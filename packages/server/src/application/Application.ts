import * as middleware from '../middleware'
import * as routes from '../routes'
import express from 'express'
import {AsyncRouter, TransactionalRouter} from '../router'
import {IApplication} from './IApplication'
import {IConfig} from './IConfig'
import {IDatabase} from '../database/IDatabase'
import {ILogger} from '../logger/ILogger'
import {IRoutes} from '@rondo/common'
import {ITransactionManager} from '../database/ITransactionManager'
import * as services from '../services'
import {loggerFactory, LoggerFactory} from '../logger/LoggerFactory'
import {urlencoded, json} from 'body-parser'

export class Application implements IApplication {
  readonly transactionManager: ITransactionManager
  readonly server: express.Application

  readonly userService: services.IUserService
  readonly teamService: services.ITeamService
  readonly siteService: services.ISiteService
  readonly storyService: services.IStoryService
  readonly commentService: services.ICommentService

  readonly authenticator: middleware.Authenticator

  readonly loggerFactory: LoggerFactory = loggerFactory

  constructor(readonly config: IConfig, readonly database: IDatabase) {
    this.transactionManager = database.transactionManager
    this.userService = new services.UserService(this.transactionManager)

    this.teamService = new services.TeamService(this.transactionManager)
    this.siteService = new services.SiteService(this.transactionManager)
    this.storyService = new services.StoryService(
      this.transactionManager, this.siteService)
    this.commentService = new services.CommentService(this.transactionManager)

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

    server.use(this.config.app.context, router)
    this.configureErrorHandling(server)
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
    const apiLogger = this.getApiLogger()

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

    router.use('/api', new routes.TeamRoutes(
      this.teamService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new routes.SiteRoutes(
      this.siteService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new routes.StoryRoutes(
      this.storyService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new routes.CommentRoutes(
      this.commentService,
      this.createTransactionalRouter(),
    ).handle)

    router.use('/api', new middleware.ErrorApiHandler(apiLogger).handle)
  }

  protected configureErrorHandling(server: express.Application) {
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
