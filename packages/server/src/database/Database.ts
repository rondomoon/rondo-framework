import { Namespace } from 'cls-hooked'
import { Connection, EntityManager, EntitySchema, ObjectType, Repository } from 'typeorm'
import { TransactionManager } from './TransactionManager'

export interface Database {
  namespace: Namespace
  transactionManager: TransactionManager
  connect(): Promise<Connection>
  getConnection(): Connection
  getEntityManager(): EntityManager
  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity>
  close(): Promise<void>
}
