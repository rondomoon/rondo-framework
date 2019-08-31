import { IApplicationConfig, IFrameworkPaths } from './IApplicationConfig'
import { IApplication } from './IApplication'
import express from 'express'

export const defaultPaths: IFrameworkPaths = {
  middleware: '/',
  app: '/app',
  api: '/api',
  frontend: '/',
}

export function createApplication(appConfig: IApplicationConfig): IApplication {
  const {config, database, framework} = appConfig
  const server = express()

  const paths = {
    ...defaultPaths,
    ...(appConfig.paths || {}),
  }

  server.set('trust proxy', 1)
  server.disable('x-powered-by')

  const router = express.Router()
  router.use(paths.middleware, ...framework.middleware)
  router.use(paths.app, ...framework.app)
  router.use(paths.api, ...framework.api)
  router.use(paths.api, framework.apiError)
  if (framework.frontend.length) {
    router.use(paths.frontend, ...framework.frontend)
  }

  server.use(config.app.context, router)
  server.use(framework.error)
  return {
    server,
    database,
  }
}
