import { IDatabase } from '../database/IDatabase'
import { IAppServer } from './IAppServer'

export interface IApplication {
  readonly server: IAppServer
  readonly database: IDatabase
}
