import loggerFactory from '@rondo.dev/logger'
import { Namespace } from 'cls-hooked'
import shortid from 'shortid'
import { Connection, EntityManager, EntitySchema, ObjectType, Repository } from 'typeorm'
import { ENTITY_MANAGER, ITransactionManager, TRANSACTION_ID } from './ITransactionManager'

const log = loggerFactory.getLogger('db')

export type TConnectionGetter = () => Connection

export class TransactionManager implements ITransactionManager {
  constructor(
    readonly ns: Namespace,
    readonly getConnection: TConnectionGetter,
  ) {}

  getEntityManager = (): EntityManager => {
    const entityManager = this.ns.get(ENTITY_MANAGER) as EntityManager
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
    return !!this.ns.get(ENTITY_MANAGER)
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
    this.ns.set(ENTITY_MANAGER, entityManager)
  }
}
