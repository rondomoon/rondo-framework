import { IConfig } from './IConfig'
import { IDatabase } from '../database'
import { ILogger } from '@rondo.dev/logger'
import { IServices } from './IServices'
import { RequestHandlerParams, ErrorRequestHandler } from 'express-serve-static-core'

export interface IFramework {
  readonly middleware: RequestHandlerParams[]
  // TODO remove app, i believe this is used in tests
  readonly app: RequestHandlerParams[]
  readonly api: RequestHandlerParams[]
  readonly apiError: ErrorRequestHandler
  readonly frontend: RequestHandlerParams[]
  readonly error: ErrorRequestHandler
}

export interface IFrameworkPaths {
  readonly middleware: string
  readonly app: string
  readonly api: string
  readonly frontend: string
}

export interface IApplicationConfig {
  readonly config: IConfig
  readonly database: IDatabase
  readonly logger: ILogger
  readonly services: IServices
  readonly paths?: Partial<IFrameworkPaths>
  readonly framework: IFramework
}
