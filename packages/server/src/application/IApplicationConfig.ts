import { IConfig } from './IConfig'
import { IDatabase } from '../database'
import { ILogger } from '@rondo.dev/logger'
import { IServices } from './IServices'
import { RequestHandlerParams, ErrorRequestHandler } from 'express-serve-static-core'

export interface IApplicationMiddleware {
  path: string
  handle: RequestHandlerParams[]
  error?: ErrorRequestHandler
}

export interface IApplicationConfig {
  readonly config: IConfig
  readonly database: IDatabase
  readonly logger: ILogger
  readonly services: IServices
  readonly globalErrorHandler: ErrorRequestHandler
  readonly framework: Record<string, IApplicationMiddleware>
}
