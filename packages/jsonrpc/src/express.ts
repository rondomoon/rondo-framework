import {FunctionPropertyNames} from './types'
import {NextFunction, Request, Response, Router} from 'express'
import {createRpcService, ERROR_SERVER} from './jsonrpc'
import {createError, isJSONRPCError, IJSONRPCError} from './error'

export type TGetContext<Context> = (req: Request) => Context

export function jsonrpc<Context>(
  getContext: TGetContext<Context>,
  idempotentMethodRegex = /^(find|fetch|get)/,
) {
  return {
   /**
    * Adds middleware for handling JSON RPC requests. Expects JSON middleware to
    * already be configured.
    */
    addService<T, F extends FunctionPropertyNames<T>>(
      service: T,
      methods: F[],
    ) {
      const callRpcService = createRpcService(service, methods)

      const router = Router()

      router.post('/', (req, res, next) => {
        callRpcService(req.body, getContext(req))
        .then(response => {
          if (response === null) {
            // notification
            res.status(204).send()
          } else {
            res.json(response)
          }
        })
        .catch(err => handleError(req.body.id, err, req, res, next))
      })

      return router
    },
  }
}

function handleError(
  id: number | string | null,
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // TODO log error
  // TODO make this nicer

  const error: IJSONRPCError<unknown> = isJSONRPCError(err)
    ? err
    : createError({
      code: ERROR_SERVER.code,
      message: err.statusCode >= 400 && err.statusCode < 500
        ? err.message
        : ERROR_SERVER.message,
    }, {
      id,
      data: null,
      statusCode: err.statusCode || 500,
    })

  res.status(error.statusCode)
  res.json(error.response)
}
