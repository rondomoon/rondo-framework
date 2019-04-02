import {Namespace} from 'cls-hooked'
import {ENTITY_MANAGER, ITransactionManager} from './ITransactionManager'
import {
  Connection,
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
} from 'typeorm'

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

  async doInTransaction<T>(fn: (entityManager: EntityManager) => Promise<T>) {
    const alreadyInTransaction = this.isInTransaction()
    if (alreadyInTransaction) {
      return await fn(this.getEntityManager())
    }

    return this.getConnection().manager
    .transaction(async entityManager => {
      this.setEntityManager(entityManager)
      try {
        return await fn(entityManager)
      } finally {
        if (!alreadyInTransaction) {
          this.setEntityManager(undefined)
        }
      }
    })
  }

  protected setEntityManager(entityManager: EntityManager | undefined) {
    this.ns.set(ENTITY_MANAGER, entityManager)
  }
}
