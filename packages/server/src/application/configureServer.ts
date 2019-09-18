import { TypeORMDatabase } from '@rondo.dev/db-typeorm'
import { Routes } from '@rondo.dev/http-types'
import { bulkjsonrpc, jsonrpc } from '@rondo.dev/jsonrpc'
import { json } from 'body-parser'
import cookieParser from 'cookie-parser'
import { loggerFactory } from '../logger'
import * as Middleware from '../middleware'
import { CSRFMiddleware, RequestLogger, TransactionMiddleware } from '../middleware'
import { TransactionalRouter } from '../router'
import * as routes from '../routes'
import { configureAuthRoutes } from '../routes/configureAuthRoutes'
import { Context, SQLTeamService, SQLUserService } from '../rpc'
import { SQLAuthService, SQLUserPermissions } from '../services'
import { Config } from './Config'
import { ServerConfig } from './ServerConfig'
import { Services } from './Services'

export type ServerConfigurator<
  T extends ServerConfig = ServerConfig
> = (
  config: Config,
  database: TypeORMDatabase,
) => T

export const configureServer: ServerConfigurator = (config, database) => {

  const logger = loggerFactory.getLogger('api')

  const services: Services = {
    authService: new SQLAuthService(database),
    userPermissions: new SQLUserPermissions(database),
  }

  const rpcServices = {
    userService: new SQLUserService(database),
    teamService: new SQLTeamService(database, services.userPermissions),
  }

  const getContext = (req: Express.Request): Context => ({user: req.user})

  const rpcMiddleware = jsonrpc(
    req => getContext(req),
    logger,
  )

  const authenticator = new Middleware.Authenticator(services.authService)
  const transactionManager = database.transactionManager

  const createTransactionalRouter = <T extends Routes>() =>
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
          new RequestLogger(logger).handle,
          json(),
          cookieParser(config.app.session.secret),
          new CSRFMiddleware({
            baseUrl: config.app.baseUrl,
            cookieName: config.app.session.name + '_csrf',
          }).handle,
          new TransactionMiddleware(database.namespace).handle,
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
          configureAuthRoutes(
            services.authService,
            authenticator,
            createTransactionalRouter(),
          ),
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
