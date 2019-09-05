import express, {ErrorRequestHandler} from 'express'
import {FunctionPropertyNames} from './types'
import {IDEMPOTENT_METHOD_REGEX} from './idempotent'
import {IErrorResponse} from './error'
import {ILogger} from '@rondo.dev/logger'
import {ISuccessResponse} from './jsonrpc'
import {NextFunction, Request, Response, Router} from 'express'
import {createError, isJSONRPCError, IJSONRPCError, IError} from './error'
import {
  createRpcService, ERROR_SERVER, ERROR_INVALID_PARAMS, ERROR_METHOD_NOT_FOUND,
  IRequest,
} from './jsonrpc'

export type TGetContext<Context> = (req: Request) => Promise<Context> | Context

export interface IJSONRPCReturnType {
  addService<T, F extends FunctionPropertyNames<T>>(
    path: string,
    service: T,
    methods?: F[],
  ): IJSONRPCReturnType,
  router(): Router
}

export interface IInvocationDetails<A extends IRequest, Context> {
  context: Context
  path: string
  request: A
}

async function defaultHook<A extends IRequest, R, Context>(
  details: IInvocationDetails<A, Context>,
  invoke: () => Promise<R>,
): Promise<R> {
  const result = await invoke()
  return result
}

export function jsonrpc<Context>(
  getContext: TGetContext<Context>,
  logger: ILogger,
  hook: <A extends IRequest, R>(
    details: IInvocationDetails<A, Context>,
    invoke: (request?: A) => Promise<R>) => Promise<R> = defaultHook,
  idempotentMethodRegex = IDEMPOTENT_METHOD_REGEX,
): IJSONRPCReturnType {

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
