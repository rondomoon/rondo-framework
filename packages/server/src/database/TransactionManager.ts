import {
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
} from 'typeorm'

export const ENTITY_MANAGER = 'ENTITY_MANAGER'
export const TRANSACTION_ID = 'TRANSACTION_ID'

export interface TransactionManager {
  getEntityManager: () => EntityManager
  getRepository: <Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ) => Repository<Entity>
  isInTransaction: () => boolean
  /**
   * Start a new or reuse an existing transaction.
   */
  doInTransaction: <T>(
    fn: (entityManager: EntityManager) => Promise<T>) => Promise<T>
  /**
   * Always start a new transaction, regardless if there is one already in
   * progress in the current context.
   */
  doInNewTransaction: <T>(
    fn: (entityManager: EntityManager) => Promise<T>) => Promise<T>
}
