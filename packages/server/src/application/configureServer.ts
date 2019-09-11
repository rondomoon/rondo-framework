import { IContext } from '@rondo.dev/common'
import { IRoutes } from '@rondo.dev/http-types'
import { bulkjsonrpc, jsonrpc } from '@rondo.dev/jsonrpc'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser'
import { IDatabase } from '../database'
import { loggerFactory } from '../logger'
import * as Middleware from '../middleware'
import { TransactionalRouter } from '../router'
import * as routes from '../routes'
import * as rpc from '../rpc'
import * as Services from '../services'
import { IConfig } from './IConfig'
import { IServerConfig } from './IServerConfig'
import { IServices } from './IServices'

export type ServerConfigurator<
  T extends IServerConfig = IServerConfig
> = (
  config: IConfig,
  database: IDatabase,
) => T

export const configureServer: ServerConfigurator = (config, database) => {

  const logger = loggerFactory.getLogger('api')

  const services: IServices = {
    authService: new Services.AuthService(database),
    userPermissions: new Services.UserPermissions(database),
  }

  const rpcServices = {
    userService: new rpc.UserService(database),
    teamService: new rpc.TeamService(database, services.userPermissions),
  }

  const getContext = (req: Express.Request): IContext => ({user: req.user})

  const rpcMiddleware = jsonrpc(
    req => getContext(req),
    logger,
    // (details, invoke) => database
    // .transactionManager
    // .doInNewTransaction(() => invoke()),
  )

  const authenticator = new Middleware.Authenticator(services.authService)
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
          new routes.AuthRoutes(
            services.authService,
            authenticator,
            createTransactionalRouter(),
          ).handle,
        ],
        error: new Middleware.ErrorApiHandler(logger).handle,
      },
      rpc: {
        path: '/rpc',
        handle: [bulkjsonrpc(rpcMiddleware, rpcServices)],
      },
    },
  }
}
