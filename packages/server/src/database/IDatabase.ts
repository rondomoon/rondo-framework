import {
  Connection, EntityManager, ObjectType, EntitySchema, Repository
} from 'typeorm'
import {ITransactionManager} from './ITransactionManager'
import {Namespace} from 'cls-hooked'

export interface IDatabase {
  namespace: Namespace
  transactionManager: ITransactionManager
  connect(): Promise<Connection>
  getConnection(): Connection
  getEntityManager(): EntityManager
  getRepository<Entity>(
    target: ObjectType<Entity> | EntitySchema<Entity> | string,
  ): Repository<Entity>
  close(): Promise<void>
}
