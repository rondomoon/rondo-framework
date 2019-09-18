import { TypeORMDatabase } from '@rondo.dev/db-typeorm'
import { Logger } from '@rondo.dev/logger'
import { ErrorRequestHandler, RequestHandlerParams } from 'express-serve-static-core'
import { Config } from './Config'
import { Services } from './Services'

export interface ServerMiddleware {
  path: string
  handle: RequestHandlerParams[]
  error?: ErrorRequestHandler
}

export interface ServerConfig {
  readonly config: Config
  readonly database: TypeORMDatabase
  readonly logger: Logger
  readonly services: Services
  readonly globalErrorHandler: ErrorRequestHandler
  readonly framework: Record<string, ServerMiddleware>
}
