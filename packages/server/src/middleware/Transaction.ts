import shortid from 'shortid'
import {IMiddleware} from './IMiddleware'
import {IHandler} from './IHandler'
import {Namespace} from 'cls-hooked'

export const CORRELATION_ID = 'CORRELATION_ID'

export class Transaction implements IMiddleware {
  constructor(readonly ns: Namespace) {}

  handle: IHandler = (req, res, next) => {
    const {ns} = this
    ns.bindEmitter(req)
    ns.bindEmitter(res)

    ns.run(() => {
      const correlationId = shortid.generate();
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