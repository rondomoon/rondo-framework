import { Namespace } from 'cls-hooked'
import { Connection, ConnectionOptions, createConnection, EntitySchema, Logger, ObjectType, Repository } from 'typeorm'
import { Database } from './Database'
import { SQLTransactionManager } from './SQLTransactionManager'
import { TransactionManager } from './TransactionManager'

export class SQLDatabase implements Database {
  protected connection?: Connection
  transactionManager: TransactionManager

  constructor(
    readonly namespace: Namespace,
    protected readonly logger: Logger,
    protected readonly options: ConnectionOptions,
  ) {
    this.transactionManager = new SQLTransactionManager(
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

  getEntityManager() {
    return this.transactionManager.getEntityManager()
  }

  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity> {
    return this.transactionManager.getRepository(target)
  }

}
