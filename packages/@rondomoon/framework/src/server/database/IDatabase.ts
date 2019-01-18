import {Connection} from 'typeorm'
import {ITransactionManager} from './ITransactionManager'
import {Namespace} from 'cls-hooked'

export interface IDatabase {
  namespace: Namespace
  transactionManager: ITransactionManager
  connect(): Promise<Connection>
  getConnection(): Connection
  close(): Promise<void>
}
