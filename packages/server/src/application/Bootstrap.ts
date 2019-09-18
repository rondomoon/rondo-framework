import { AddressInfo } from 'net'
import { Application } from './Application'
import { Config } from './Config'
import { TypeORMDatabase } from '@rondo.dev/db-typeorm'

export interface Bootstrap {
  readonly application: Application
  readonly database: TypeORMDatabase
  getConfig(): Config
  listen(port?: number | string, hostname?: string): Promise<void>
  getAddress(): AddressInfo | string
  close(): Promise<void>
}
