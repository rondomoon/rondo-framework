export type TId = number | string
import {ArgumentTypes, FunctionPropertyNames, RetType} from './types'
import {isPromise} from './isPromise'
import {createError, IErrorResponse, IErrorWithData} from './error'

export const ERROR_PARSE = {
  code: -32700,
  message: 'Parse error',
}

export const ERROR_INVALID_REQUEST = {
  code: -32600,
  message: 'Invalid request',
}

export const ERROR_METHOD_NOT_FOUND = {
  code: -32601,
  message: 'Method not found',
}

export const ERROR_INVALID_PARAMS = {
  code: -32602,
  message: 'Invalid params',
}

export const ERROR_INTERNAL_ERROR = {
  code: -32603,
  message: 'Internal error',
}

export const ERROR_SERVER = {
  code: -32000,
  message: 'Server error',
}

export function pick<T, K extends FunctionPropertyNames<T>>(t: T, keys: K[])
  : Pick<T, K> {
  return keys.reduce((obj, key) => {
    // tslint:disable-next-line
    const fn = t[key] as unknown as Function
    obj[key] = fn.bind(t)
    return obj
  }, {} as Pick<T, K>)
}

export interface IRequest<M extends string = any, A = any[]> {
  jsonrpc: '2.0'
  id: TId | null
  method: M
  params: A
}

export interface ISuccessResponse<T> {
  jsonrpc: '2.0'
  id: TId
  result: T
  error: null
}

export type IResponse<T = any> = ISuccessResponse<T> | IErrorResponse<T>

export function createSuccessResponse<T>(id: number | string, result: T)
  : ISuccessResponse<T> {
  return {
    jsonrpc: '2.0',
    id,
    result,
    error: null,
  }
}

export const createRpcService = <T, M extends FunctionPropertyNames<T>>(
  service: T,
  methods: M[],
) => {
  return {
    async invoke<Context>(
      req: IRequest<M, ArgumentTypes<T[M]>>,
      context: Context,
    ): Promise<ISuccessResponse<RetType<T[M]>> | null> {
      const {id, method, params} = req

      if (
        req.jsonrpc !== '2.0' ||
        typeof method !== 'string' ||
        !Array.isArray(params)
      ) {
        console.log(req.jsonrpc, method, params)
        throw createError(ERROR_INVALID_REQUEST, {
          id,
          data: null,
          statusCode: 400,
        })
      }

      const isNotification = req.id === null || req.id === undefined

      const rpcService = pick(service, methods)

      if (
        !rpcService.hasOwnProperty(method) ||
        typeof rpcService[method] !== 'function'
      ) {
        throw createError(ERROR_METHOD_NOT_FOUND, {
          id,
          data: null,
          statusCode: 404,
        })
      }

      let retValue = (rpcService[method] as any)(...params)

      if (typeof retValue === 'function') {
        retValue = retValue(context)
      }

      if (!isPromise(retValue) && isNotification) {
        return null
      }

      retValue = await retValue
      return createSuccessResponse(req.id as any, retValue)
    },
  }
}
