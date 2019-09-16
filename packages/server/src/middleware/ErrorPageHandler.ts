import { Logger } from '@rondo.dev/logger'
import { ErrorHandler } from './ErrorHandler'
import { Middleware } from './Middleware'

export class ErrorPageHandler implements Middleware {
  constructor(readonly logger: Logger) {}

  handle: ErrorHandler = (err, req, res, next) => {
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
