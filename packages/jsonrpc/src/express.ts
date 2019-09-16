import { Logger } from '@rondo.dev/logger'
import express, { ErrorRequestHandler, Request, Response, Router } from 'express'
import { createError, ErrorResponse, isRPCError } from './error'
import { IDEMPOTENT_METHOD_REGEX } from './idempotent'
import { createRpcService, ERROR_METHOD_NOT_FOUND, ERROR_SERVER, Request as RPCRequest, SuccessResponse } from './jsonrpc'
import { FunctionPropertyNames } from './types'

export type GetContext<Context> = (req: Request) => Promise<Context> | Context

export interface RPCReturnType {
  addService<T, F extends FunctionPropertyNames<T>>(
    path: string,
    service: T,
    methods?: F[],
  ): RPCReturnType
  router(): Router
}

export interface InvocationDetails<A extends RPCRequest, Context> {
  context: Context
  path: string
  request: A
}

async function defaultHook<A extends RPCRequest, R, Context>(
  details: InvocationDetails<A, Context>,
  invoke: () => Promise<R>,
): Promise<R> {
  const result = await invoke()
  return result
}

export function jsonrpc<Context>(
  getContext: GetContext<Context>,
  logger: Logger,
  hook: <A extends RPCRequest, R>(
    details: InvocationDetails<A, Context>,
    invoke: (request?: A) => Promise<R>) => Promise<R> = defaultHook,
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
): RPCReturnType {

  /* eslint @typescript-eslint/no-unused-vars: 0 */
  const handleError: ErrorRequestHandler = (err, req, res, next) => {
    logger.error('JSON-RPC Error: %s', err.stack)

    if (isRPCError(err)) {
      res.status(err.statusCode)
      res.json(err.response)
      return
    }

    const id = getRequestId(req)
    const statusCode: number = err.statusCode || 500
    const errorResponse: ErrorResponse<unknown> = {
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

  const router = Router()

  const self = {
   /**
    * Adds middleware for handling JSON RPC requests. Expects JSON middleware to
    * already be configured.
    */
    addService<T, F extends FunctionPropertyNames<T>>(
      path: string,
      service: T,
      methods?: F[],
    ) {
      const rpcService = createRpcService(service, methods)

      function handleResponse(
        response: SuccessResponse<unknown> | null,
        res: Response,
      ) {
        if (response === null) {
          // notification
          res.status(204).send()
        } else {
          res.json(response)
        }
      }

      router.get(path, (req, res, next) => {
        if (!idempotentMethodRegex.test(req.query.method)) {
          // TODO fix status code and error type
          const err = createError(ERROR_METHOD_NOT_FOUND, {
            id: req.query.id,
            data: null,
            statusCode: 405,
          })
          throw err
        }
        const request = {
          id: req.query.id,
          jsonrpc: req.query.jsonrpc,
          method: req.query.method,
          params: JSON.parse(req.query.params),
        }
        Promise.resolve(getContext(req))
        .then(context =>
          hook(
            {path, request, context},
            (body = request) => rpcService.invoke(body, context)))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.post(path, (req, res, next) => {
        Promise.resolve(getContext(req))
        .then(context =>
          hook(
            {path, request: req.body, context},
            (body = req.body) => rpcService.invoke(body, context)))
        .then(response => handleResponse(response, res))
        .catch(next)
      })

      router.use(path, handleError)
      return self
    },
    router() {
      return router
    },
  }

  return self
}

function getRequestId(req: express.Request) {
  const id = req.method === 'POST' ? req.body.id : req.query.id
  return id !== undefined ? id : null
}
