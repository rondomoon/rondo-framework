import {IHandler} from './IHandler'
import {ILogger} from '../logger/ILogger'
import {IMiddleware} from './IMiddleware'

export class RequestLogger implements IMiddleware {
  constructor(protected readonly logger: ILogger) {}

  handle: IHandler = (req, res, next) => {
    const start = Date.now()
    res.on('finish', () => {
      const { method, originalUrl, user } = req
      const username = user ? user.username : ''
      const duration = Date.now() - start
      this.logger.debug('%s %s [%s] %j',
        method, originalUrl, username, req.body)
      const { statusCode } = res
      this.logger.info('%s %s [%s] %d %sms',
        method, originalUrl, username, statusCode, duration)
    })
    next()
  }
}
