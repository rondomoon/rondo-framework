import { IServerConfig } from './IServerConfig'
import { IApplication } from './IApplication'
import express from 'express'

export function createServer(appConfig: IServerConfig): IApplication {
  const {config, database, framework} = appConfig
  const server = express()

  server.set('trust proxy', 1)
  server.disable('x-powered-by')

  const router = express.Router()

  Object.keys(framework)
  .forEach(name => {
    const {path, handle, error} = framework[name]
    router.use(path, ...handle)
    if (error) {
      router.use(path, error)
    }
  })

  server.use(config.app.context, router)
  server.use(appConfig.globalErrorHandler)

  return {
    server,
    database,
  }
}
