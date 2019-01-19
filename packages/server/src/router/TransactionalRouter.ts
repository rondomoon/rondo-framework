import express from 'express'
import {AsyncRouter} from './AsyncRouter'
import {IRoutes, IMethod} from '@rondo/common'
import {ITransactionManager} from '../database/ITransactionManager'
import {ITypedHandler} from './ITypedHandler'

export class TransactionalRouter<R extends IRoutes> extends AsyncRouter<R> {
  constructor(readonly transactionManager: ITransactionManager) {
    super()
  }

  protected wrapHandler<M extends IMethod, P extends keyof R & string>(
    handler: ITypedHandler<R, P, M>,
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
