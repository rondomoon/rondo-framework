import express from 'express'
import {AsyncRouter, IHandler} from './AsyncRouter'
import {IRoutes, IMethod} from '../../common/REST'
import {ITransactionManager} from '../database/ITransactionManager'

export class TransactionalRouter<R extends IRoutes> extends AsyncRouter<R> {
  constructor(readonly transactionManager: ITransactionManager) {
    super()
  }

  protected wrapHandler<M extends IMethod, P extends keyof R & string>(
    handler: IHandler<R, P, M>,
  ): express.RequestHandler {
    return async (req, res, next) => {
      await this.transactionManager
      .doInTransaction(async () => {
        const response = await handler(req, res, next)
        res.json(response)
      })
      .catch(next)
    }
  }
}
