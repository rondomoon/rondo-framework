import express from 'express'
import {AsyncRouter} from './AsyncRouter'
import {IRoutes, TMethod} from '@rondo.dev/common'
import {ITransactionManager} from '../database/ITransactionManager'
import {TTypedHandler} from './TTypedHandler'

export class TransactionalRouter<R extends IRoutes> extends AsyncRouter<R> {
  constructor(readonly transactionManager: ITransactionManager) {
    super()
  }

  protected wrapHandler<M extends TMethod, P extends keyof R & string>(
    handler: TTypedHandler<R, P, M>,
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
