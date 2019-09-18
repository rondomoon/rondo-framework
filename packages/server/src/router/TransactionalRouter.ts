import { TransactionManager } from '@rondo.dev/db'
import { Method, Routes } from '@rondo.dev/http-types'
import express from 'express'
import { AsyncRouter } from './AsyncRouter'
import { TypedHandler } from './TypedHandler'

export class TransactionalRouter<R extends Routes> extends AsyncRouter<R> {
  constructor(readonly transactionManager: TransactionManager) {
    super()
  }

  protected wrapHandler<M extends Method, P extends keyof R & string>(
    handler: TypedHandler<R, P, M>,
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
