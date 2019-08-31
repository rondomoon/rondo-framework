import cookieParser from 'cookie-parser'
import { json } from 'body-parser'
import { IDatabase } from '../database'
import { loggerFactory } from '../logger'
import * as Middleware from '../middleware'
import * as Services from '../services'
import * as Team from '../team'
import * as User from '../user'
import { IApplicationConfig } from './IApplicationConfig'
import { IConfig } from './IConfig'
import { IServices } from './IServices'
import * as routes from '../routes'
import { TransactionalRouter } from '../router'
import { IRoutes, IContext } from '@rondo.dev/common'
import { Express } from 'express-serve-static-core'

export type AppConfigurator<
  T extends IApplicationConfig = IApplicationConfig
> = (
  config: IConfig,
  database: IDatabase,
) => T

export const configureApplication: AppConfigurator = (config, database) => {

  const logger = loggerFactory.getLogger('api')

  const services: IServices = {
    userService: new Services.UserService(database),
    teamService: new Team.TeamService(database),
    userPermissions: new User.UserPermissions(database),
  }

  const authenticator = new Middleware.Authenticator(services.userService)
  const transactionManager = database.transactionManager

  const createTransactionalRouter = <T extends IRoutes>() =>
    new TransactionalRouter<T>(transactionManager)

  const globalErrorHandler = new Middleware.ErrorPageHandler(logger).handle

  return {
    config,
    database,
    logger,
    services,
    globalErrorHandler,
    framework: {
      middleware: {
        path: '/',
        handle: [
          new Middleware.SessionMiddleware({
            transactionManager,
            baseUrl: config.app.baseUrl,
            sessionName: config.app.session.name,
            sessionSecret: config.app.session.secret,
          }).handle,
          new Middleware.RequestLogger(logger).handle,
          json(),
          cookieParser(config.app.session.secret),
          new Middleware.CSRFMiddleware({
            baseUrl: config.app.baseUrl,
            cookieName: config.app.session.name + '_csrf',
          }).handle,
          new Middleware.Transaction(database.namespace).handle,
          authenticator.handle,
        ],
      },
      app: {
        path: '/app',
        handle: [routes.application],
      },
      api: {
        path: '/api',
        handle: [
          new routes.LoginRoutes(
            services.userService,
            authenticator,
            createTransactionalRouter(),
          ).handle,
          new routes.UserRoutes(
            services.userService,
            createTransactionalRouter(),
          ).handle,
          new Team.TeamRoutes(
            services.teamService,
            services.userPermissions,
            createTransactionalRouter(),
          ).handle,
        ],
        error: new Middleware.ErrorApiHandler(logger).handle,
      },
    },
  }
}
