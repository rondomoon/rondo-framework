import {IDatabase} from './IDatabase'
import {Namespace} from 'cls-hooked'
import {TransactionManager} from './TransactionManager'
import {createConnection, Connection, ConnectionOptions, Logger} from 'typeorm'

export class Database implements IDatabase {
  protected connection?: Connection
  transactionManager: TransactionManager

  constructor(
    readonly namespace: Namespace,
    protected readonly logger: Logger,
    protected readonly options: ConnectionOptions,
  ) {
    this.transactionManager = new TransactionManager(
      namespace,
      this.getConnection,
    )
  }

  async connect(): Promise<Connection> {
    this.connection = await createConnection({
      ...this.options,
      logger: this.logger,
    })
    return this.connection
  }

  getConnection = (): Connection => {
    if (!this.connection) {
      throw new Error('Not connected! Did you call connect?')
    }
    return this.connection
  }

  async close() {
    await this.getConnection().close()
  }

}
