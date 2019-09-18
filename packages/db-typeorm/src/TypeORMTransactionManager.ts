import { TRANSACTION, TransactionManager, TRANSACTION_ID } from '@rondo.dev/db'
import loggerFactory from '@rondo.dev/logger'
import { Namespace } from 'cls-hooked'
import shortid from 'shortid'
import { Connection, EntityManager, EntitySchema, ObjectType, Repository } from 'typeorm'

const log = loggerFactory.getLogger('db')

export type GetConnection = () => Connection

export class TypeORMTransactionManager
implements TransactionManager<EntityManager> {
  constructor(
    readonly ns: Namespace,
    readonly getConnection: GetConnection,
  ) {}

  getEntityManager = (): EntityManager => {
    const entityManager = this.ns.get(TRANSACTION) as EntityManager
    if (entityManager) {
      return entityManager
    }
    return this.getConnection().manager
  }

  getRepository = <Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity> => {
    return this.getEntityManager().getRepository(target)
  }

  isInTransaction = (): boolean => {
    return !!this.ns.get(TRANSACTION)
  }

  async doInTransaction<T>(fn: (em: EntityManager) => Promise<T>) {
    const alreadyInTransaction = this.isInTransaction()
    if (alreadyInTransaction) {
      log.info('doInTransaction: reusing existing transaction')
      return await fn(this.getEntityManager())
    }

    log.info('doInTransaction: starting new transaction')
    return this.doInNewTransaction(fn)
  }

  async doInNewTransaction<T>(fn: (em: EntityManager) => Promise<T>) {
    return this.ns.runAndReturn(async () => {
      this.setTransactionId(shortid())
      try {
        return await this.getConnection().manager
        .transaction(async entityManager => {
          this.setEntityManager(entityManager)
          try {
            return await fn(entityManager)
          } finally {
            this.setEntityManager(undefined)
          }
        })
      } finally {
        this.setTransactionId(undefined)
      }
    })
  }

  protected setTransactionId(transactionId: string | undefined) {
    this.ns.set(TRANSACTION_ID, transactionId)
  }

  protected setEntityManager(entityManager: EntityManager | undefined) {
    this.ns.set(TRANSACTION, entityManager)
  }
}
