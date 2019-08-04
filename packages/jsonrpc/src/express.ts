import express, {ErrorRequestHandler} from 'express'
import {FunctionPropertyNames} from './types'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'
import {IErrorResponse} from './error'
import {ILogger} from '@rondo/common'
import {ISuccessResponse} from './jsonrpc'
import {NextFunction, Request, Response, Router} from 'express'
import {createError, isJSONRPCError, IJSONRPCError, IError} from './error'
import {createRpcService, ERROR_SERVER, ERROR_INVALID_PARAMS} from './jsonrpc'

export type TGetContext<Context> = (req: Request) => Context

export function jsonrpc<Context>(
  getContext: TGetContext<Context>,
  logger: ILogger,
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
) {

  const handleError: ErrorRequestHandler = (err, req, res, next) => {
    logger.error('JSON-RPC Error: %s', err.stack)

    if (isJSONRPCError(err)) {
      res.status(err.statusCode)
      res.json(err.response)
      return
    }

    const id = getRequestId(req)
    const statusCode: number = err.statusCode || 500
    const errorResponse: IErrorResponse<unknown> = {
      jsonrpc: '2.0',
      id,
      result: null,
      error: {
        code: ERROR_SERVER.code,
        message: statusCode >= 500 ? ERROR_SERVER.message : err.message,
        data: 'errors' in err ? err.errors : null,
      },
    }
    res.status(statusCode)
    res.json(errorResponse)
  }

  return {
   /**
    * Adds middleware for handling JSON RPC requests. Expects JSON middleware to
    * already be configured.
    */
    addService<T, F extends FunctionPropertyNames<T>>(
      service: T,
      methods: F[],
    ) {
      const rpcService = createRpcService(service, methods)

      const router = Router()

      function handleResponse(
        response: ISuccessResponse<unknown> | null,
        res: Response,
      ) {
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
        const request = {
          id: req.query.id,
          jsonrpc: req.query.jsonrpc,
          method: req.query.method,
          params: JSON.parse(req.query.params),
        }
        rpcService.invoke(request, getContext(req))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.post('/', (req, res, next) => {
        rpcService.invoke(req.body, getContext(req))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.use('/', handleError)

      return router
    },
  }

}

function getRequestId(req: express.Request) {
  const id = req.method === 'POST' ? req.body.id : req.query.id
  return id !== undefined ? id : null
}
