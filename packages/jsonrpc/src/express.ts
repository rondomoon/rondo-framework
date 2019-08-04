import {FunctionPropertyNames} from './types'
import {NextFunction, Request, Response, Router} from 'express'
import {createRpcService, ERROR_SERVER, ERROR_INVALID_PARAMS} from './jsonrpc'
import {createError, isJSONRPCError, IJSONRPCError} from './error'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'

export type TGetContext<Context> = (req: Request) => Context

export function jsonrpc<Context>(
  getContext: TGetContext<Context>,
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
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

      function handleResponse(response: any, res: Response) {
        if (response === null) {
          // notification
          res.status(204).send()
        } else {
          res.json(response)
        }
      }

      router.get('/', (req, res, next) => {
        if (!idempotentMethodRegex.test(req.query.method)) {
          // TODO fix status code and error type
          const err = createError(ERROR_SERVER, {
            id: req.query.id,
            data: null,
            statusCode: 400,
          })
          throw err
        }
        callRpcService(req.query, getContext(req))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.post('/', (req, res, next) => {
        callRpcService(req.body, getContext(req))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.use('/', handleError)

      return router
    },
  }
}

function handleError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const id = req.method === 'POST' ? req.body.id : req.query.id
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
