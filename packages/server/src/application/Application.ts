import { AppServer } from './AppServer'
import { TypeORMDatabase } from '@rondo.dev/db-typeorm'

export interface Application {
  readonly server: AppServer
  readonly database: TypeORMDatabase
}
