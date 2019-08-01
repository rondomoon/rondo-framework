import {NextFunction, Request, Response, Router} from 'express'

export const ERROR_PARSE = {
  code: -32700, message: 'Parse error', data: null}
export const ERROR_INVALID_REQUEST = {
  code: -32600,
  message: 'Invalid Request',
  data: null}
export const ERROR_METHOD_NOT_FOUND = {
  code: -32601,
  message: 'Method not found',
  data: null,
}
export const ERROR_INVALID_PARAMS = {
  code: -32602,
  message: 'Invalid params',
  data: null,
}
export const ERROR_INTERNAL_ERROR = {
  code: -32603,
  message: 'Internal error',
  data: null,
}
export const ERROR_SERVER = {
  code: -32000,
  message: 'Server error',
  data: null,
}

export interface ISuccessResponse<T> {
  jsonrpc: '2.0'
  id: number
  result: T
  error: null
}

export interface IJsonRpcError<T> {
  code: number
  message: string
  data: T
}

export interface IErrorResponse<T> {
  jsonrpc: '2.0'
  id: number | null
  result: null
  error: IJsonRpcError<T>
}

export type IRpcResponse<T> = ISuccessResponse<T> | IErrorResponse<T>

export function createSuccessResponse<T>(id: number, result: T)
  : ISuccessResponse<T> {
  return {
    jsonrpc: '2.0',
    id,
    result,
    error: null,
  }
}

export function createErrorResponse<T>(
  id: number | null, error: IJsonRpcError<T>)
  : IErrorResponse<T> {
  return {
    jsonrpc: '2.0',
    id,
    result: null,
    error,
  }
}

export type FunctionPropertyNames<T> = {
  // tslint:disable-next-line
  [K in keyof T]: T[K] extends Function ? K : never
}[keyof T]

export function pick<T, K extends FunctionPropertyNames<T>>(t: T, keys: K[])
  : Pick<T, K> {
  return keys.reduce((obj, key) => {
    // tslint:disable-next-line
    const fn = t[key] as unknown as Function
    obj[key] = fn.bind(t)
    return obj
  }, {} as Pick<T, K>)
}

function isPromise(value: any): value is Promise<unknown> {
  return value !== null && typeof value === 'object' &&
    'then' in value && 'catch' in value &&
    typeof value.then === 'function' && typeof value.catch === 'function'
}

/**
 * Adds middleware for handling JSON RPC requests. Expects JSON middleware to
 * already be configured.
 */
export function jsonrpc<T, F extends FunctionPropertyNames<T>, Ctx>(
  service: T,
  functions: F[],
  getContext: (req: Request) => Ctx,
) {
  const rpcService = pick(service, functions)

  const router = Router()

  router.post('/', (req, res, next) => {
    if (req.headers['content-type'] !== 'application/json') {
      res.status(400)
      return res.json(createErrorResponse(null, ERROR_PARSE))
    }
    const {id, method, params} = req.body
    const isNotification = id === null || id === undefined
    if (
      req.body.jsonrpc !== '2.0' ||
      typeof method !== 'string' ||
      !Array.isArray(params)
    ) {
      res.status(400)
      return res.json(createErrorResponse(id, ERROR_INVALID_REQUEST))
    }

    if (
      !rpcService.hasOwnProperty(method) ||
      typeof (rpcService as any)[method] !== 'function'
    ) {
      res.status(404)
      return res.json(createErrorResponse(id, ERROR_METHOD_NOT_FOUND))
    }

    // if (rpcService[method].arguments.length !== params.length) {
    //   return res.json(createErrorResponse(null, ERROR_INVALID_PARAMS))
    // }

    // TODO handle synchronous errors
    let retValue
    try {
      retValue = (rpcService as any)[method](...params)
      if (typeof retValue === 'function') {
        retValue = retValue(getContext(req))
      }
    } catch (err) {
      return handleError(err, req, res, next)
    }

    if (!isPromise(retValue)) {
      if (isNotification) {
        return res.status(204).send()
      }
      return res.json(createSuccessResponse(id, retValue))
    }

    retValue
    .then(result => {
      return res.json(createSuccessResponse(id, result))
    })
    .catch(err => handleError(err, req, res, next))
  })

  return router
}

function handleError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const statusCode: number = 'statusCode' in err &&
    typeof err.statusCode === 'number'
    ? err.statusCode
    : 500

  const message = statusCode >= 400 && statusCode < 500
    ? err.message
    : ERROR_SERVER.message

  res.status(statusCode)
  res.json(createErrorResponse(req.body.id, {
    code: ERROR_SERVER.code,
    message,
    data: err.errors,
  }))
}
