import {
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
} from 'typeorm'

export const ENTITY_MANAGER = 'ENTITY_MANAGER'

export interface ITransactionManager {
  getEntityManager: () => EntityManager
  getRepository: <Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ) => Repository<Entity>
  isInTransaction: () => boolean
  doInTransaction: <T>(
    fn: (entityManager: EntityManager) => Promise<T>) => Promise<T>
}
