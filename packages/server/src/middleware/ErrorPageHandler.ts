import {ILogger} from '@rondo.dev/logger'
import {IMiddleware} from './IMiddleware'
import {TErrorHandler} from './TErrorHandler'

export class ErrorPageHandler implements IMiddleware {
  constructor(readonly logger: ILogger) {}

  handle: TErrorHandler = (err, req, res, next) => {
    this.logger.error(
      '%s An error occurred: %s',
      req.correlationId, err.stack)
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
