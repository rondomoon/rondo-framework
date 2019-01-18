import express from 'express'
import {AsyncRouter} from '../router'
import {IRoutes} from '@rondo/common'
import {IDatabase} from '../database/IDatabase'

export interface IApplication {
  readonly server: express.Application
  readonly database: IDatabase

  createAsyncRouter<T extends IRoutes>(): AsyncRouter<T>
  createTransactionalRouter<T extends IRoutes>(): AsyncRouter<T>
}
