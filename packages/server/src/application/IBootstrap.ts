import {AddressInfo} from 'net'
import {IApplication} from './IApplication'
import {IDatabase} from '../database/IDatabase'
import {IConfig} from './IConfig'

export interface IBootstrap {
  readonly application: IApplication
  readonly database: IDatabase
  getConfig(): IConfig
  listen(port?: number | string, hostname?: string): Promise<void>
  getAddress(): AddressInfo | string
  close(): Promise<void>
}
