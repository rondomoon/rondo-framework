import {IHandler} from './IHandler'
import {ILogger} from '../logger/ILogger'
import {IMiddleware} from './IMiddleware'

export class RequestLogger implements IMiddleware {
  constructor(protected readonly logger: ILogger) {}

  handle: IHandler = (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const duration = Date.now() - start
      const { method, originalUrl } = req
      const { statusCode } = res
      this.logger.info('%s %s %d %sms',
        method, originalUrl, statusCode, duration)
    })
    next()
  }
}
