import express, {ErrorRequestHandler} from 'express'
import {FunctionPropertyNames} from './types'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'
import {IErrorResponse} from './jsonrpc'
import {ISuccessResponse} from './jsonrpc'
import {NextFunction, Request, Response, Router} from 'express'
import {createError, isJSONRPCError, IJSONRPCError, IError} from './error'
import {createRpcService, ERROR_SERVER, ERROR_INVALID_PARAMS} from './jsonrpc'

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

  const handleError: ErrorRequestHandler = (err, req, res, next) => {
    // TODO log error

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
}

function getRequestId(req: express.Request) {
  const id = req.method === 'POST' ? req.body.id : req.query.id
  return id !== undefined ? id : null
}
