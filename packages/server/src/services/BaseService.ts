import {
  EntityManager,
  EntitySchema,
  ObjectType,
  Repository,
} from 'typeorm'
import {ITransactionManager} from '../database/ITransactionManager'

export abstract class BaseService {
  constructor(protected readonly transactionManager: ITransactionManager) {}

  getEntityManager(): EntityManager {
    return this.transactionManager.getEntityManager()
  }

  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity> {
    return this.transactionManager.getRepository(target)
  }
}
