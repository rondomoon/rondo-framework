import { Database } from '../database/Database'
import { AppServer } from './AppServer'

export interface Application {
  readonly server: AppServer
  readonly database: Database
}
