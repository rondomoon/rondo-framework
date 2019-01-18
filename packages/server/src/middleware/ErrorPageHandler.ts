import {IMiddleware} from './IMiddleware'
import {IErrorHandler} from './IErrorHandler'
import {ILogger} from '../logger/ILogger'

export class ErrorPageHandler implements IMiddleware {
  constructor(readonly logger: ILogger) {}

  handle: IErrorHandler = (err, req, res, next) => {
    this.logger.error('An error occurred: %s', err.stack)
    // TODO Show an error page!
    const statusCode = this.getStatus(err)
    res.status(statusCode)
    res.end('An error occurred')
  }

  protected getStatus(err: Error): number {
    if (typeof (err as any).status === 'number') {
      return (err as any).status
    }
    return 500
  }
}
