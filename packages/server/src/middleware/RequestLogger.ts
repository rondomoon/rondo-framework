import { Logger } from '@rondo.dev/logger'
import shortid from 'shortid'
import { Handler } from './Handler'
import { Middleware } from './Middleware'

export class RequestLogger implements Middleware {
  constructor(protected readonly logger: Logger) {}

  handle: Handler = (req, res, next) => {
    const start = Date.now()
    req.correlationId = shortid.generate()
    res.on('finish', () => {
      const { method, originalUrl, user } = req
      const username = user ? user.username : ''
      const duration = Date.now() - start
      this.logger.debug('%s %s %s [%s] %j',
        req.correlationId, method, originalUrl, username, req.body)
      const { statusCode } = res
      this.logger.info('%s %s %s [%s] %d %sms',
        req.correlationId, method, originalUrl, username, statusCode, duration)
    })
    next()
  }
}
