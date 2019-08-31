import express from 'express'
import {AsyncRouter} from '../router'
import {IRoutes} from '@rondo.dev/common'
import {IDatabase} from '../database/IDatabase'

export interface IApplication {
  readonly server: express.Application
  readonly database: IDatabase
}
