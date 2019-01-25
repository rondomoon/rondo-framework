import {IHandler} from './IHandler'
import {ILogger} from '../logger/ILogger'
import {IMiddleware} from './IMiddleware'

export class RequestLogger implements IMiddleware {
  constructor(protected readonly logger: ILogger) {}

  handle: IHandler = (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const { method, originalUrl } = req
      const duration = Date.now() - start
      this.logger.debug('%s %s %j', method, originalUrl, req.body)
      const { statusCode } = res
      this.logger.info('%s %s %d %sms',
        method, originalUrl, statusCode, duration)
    })
    next()
  }
}
