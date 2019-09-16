import { Config } from './Config'
import { Database } from '../database'
import { Logger } from '@rondo.dev/logger'
import { Services } from './Services'
import { RequestHandlerParams, ErrorRequestHandler } from 'express-serve-static-core'

export interface ServerMiddleware {
  path: string
  handle: RequestHandlerParams[]
  error?: ErrorRequestHandler
}

export interface ServerConfig {
  readonly config: Config
  readonly database: Database
  readonly logger: Logger
  readonly services: Services
  readonly globalErrorHandler: ErrorRequestHandler
  readonly framework: Record<string, ServerMiddleware>
}
