import {AddressInfo} from 'net'
import {Application} from './Application'
import {Database} from '../database/Database'
import {Config} from './Config'

export interface Bootstrap {
  readonly application: Application
  readonly database: Database
  getConfig(): Config
  listen(port?: number | string, hostname?: string): Promise<void>
  getAddress(): AddressInfo | string
  close(): Promise<void>
}
