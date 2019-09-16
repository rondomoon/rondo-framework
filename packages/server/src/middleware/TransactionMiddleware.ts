import shortid from 'shortid'
import {Middleware} from './Middleware'
import {Handler} from './Handler'
import {Namespace} from 'cls-hooked'

export const CORRELATION_ID = 'CORRELATION_ID'

export class TransactionMiddleware implements Middleware {
  constructor(readonly ns: Namespace) {}

  handle: Handler = (req, res, next) => {
    const {ns} = this
    ns.bindEmitter(req)
    ns.bindEmitter(res)

    ns.run(() => {
      // use pregenerated request correlationId
      const correlationId = ns.get(CORRELATION_ID) || req.correlationId ||
        shortid.generate();
      (req as any).correlationId = correlationId
      ns.set(CORRELATION_ID, correlationId)
      next()
    })
  }

  getCorrelationId = (): string => {
    try {
      return this.ns.get(CORRELATION_ID)
    } catch (err) {
      return ''
    }
  }

}
