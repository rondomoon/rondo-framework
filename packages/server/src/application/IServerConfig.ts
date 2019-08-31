import { IConfig } from './IConfig'
import { IDatabase } from '../database'
import { ILogger } from '@rondo.dev/logger'
import { IServices } from './IServices'
import { RequestHandlerParams, ErrorRequestHandler } from 'express-serve-static-core'

export interface IServerMiddleware {
  path: string
  handle: RequestHandlerParams[]
  error?: ErrorRequestHandler
}

export interface IServerConfig {
  readonly config: IConfig
  readonly database: IDatabase
  readonly logger: ILogger
  readonly services: IServices
  readonly globalErrorHandler: ErrorRequestHandler
  readonly framework: Record<string, IServerMiddleware>
}
