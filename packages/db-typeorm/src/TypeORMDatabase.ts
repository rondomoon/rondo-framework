import { Database } from '@rondo.dev/db'
import { Namespace } from 'cls-hooked'
import { Connection, ConnectionOptions, createConnection, EntityManager, EntitySchema, Logger, ObjectType, Repository } from 'typeorm'
import { TypeORMTransactionManager } from './TypeORMTransactionManager'

export class TypeORMDatabase implements Database<
  Connection, EntityManager, TypeORMTransactionManager>
{
  protected connection?: Connection
  transactionManager: TypeORMTransactionManager

  constructor(
    readonly namespace: Namespace,
    protected readonly logger: Logger,
    protected readonly options: ConnectionOptions,
  ) {
    this.transactionManager = new TypeORMTransactionManager(
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

