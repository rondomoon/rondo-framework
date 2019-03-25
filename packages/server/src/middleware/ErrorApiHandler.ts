import {IErrorHandler} from './IErrorHandler'
import {ILogger} from '../logger/ILogger'
import {IMiddleware} from './IMiddleware'
import {ValidationError} from '../validator'

export class ErrorApiHandler implements IMiddleware {
  constructor(readonly logger: ILogger) {}

  handle: IErrorHandler = (err, req, res, next) => {
    this.logger.error('%s An API error occurred: %s',
      req.correlationId, err.stack)
    const statusCode = this.getStatus(err)
    res.status(statusCode)
    if (ValidationError.isInstanceOf(err)) {
      res.json({
        error: err.message,
        errors: err.errors,
      })
      return
    }
    res.json({
      error: 'An error occurred',
      errors: [],
    })
  }

  protected getStatus(err: Error): number {
    if (typeof (err as any).status === 'number') {
      return (err as any).status
    }
    return 500
  }
}
