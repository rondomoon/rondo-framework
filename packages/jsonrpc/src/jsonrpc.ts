export type Id = number | string
import { getValidatorsForInstance, getValidatorsForMethod, Validate } from './ensure'
import { createError, ErrorResponse } from './error'
import { isPromise } from './isPromise'
import { ArgumentTypes, FunctionPropertyNames, RetType } from './types'

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

export function pick<T, K extends FunctionPropertyNames<T>>(
  t: T, keys: K[]): Pick<T, K> {
  return keys.reduce((obj, key) => {
    // tslint:disable-next-line
    const fn = t[key] as unknown as Function
    obj[key] = fn.bind(t)
    return obj
  }, {} as Pick<T, K>)
}

export function getAllMethods<T>(obj: T): Array<FunctionPropertyNames<T>> {
  const props = new Set<string>()
  do {
    Object.getOwnPropertyNames(obj)
    .filter(p => {
      return typeof (obj as any)[p] === 'function' &&
        p.startsWith('_') === false &&
        p !== 'constructor'
    })
    .forEach(p => props.add(p))
    obj = Object.getPrototypeOf(obj)
  } while (Object.getPrototypeOf(obj))

  return Array.from(props) as unknown as Array<FunctionPropertyNames<T>>
}

export interface Request<M extends string = any, A = any[]> {
  jsonrpc: '2.0'
  id: Id | null
  method: M
  params: A
}

export interface SuccessResponse<T> {
  jsonrpc: '2.0'
  id: Id
  result: T
  error: null
}

export type Response<T = any> = SuccessResponse<T> | ErrorResponse<T>

export function createSuccessResponse<T>(
  id: number | string,
  result: T,
): SuccessResponse<T> {
  return {
    jsonrpc: '2.0',
    id,
    result,
    error: null,
  }
}

async function validateServiceContext<
  T, M extends FunctionPropertyNames<T>, Context
>(
  id: string | number | null,
  service: T,
  method: M,
  context: Context,
) {

  async function doValidate(validate: Validate<Context>) {
    const success = await validate(context)
    if (!success) {
      // TODO make this an error like 401
      throw createError(ERROR_INVALID_REQUEST, {
        id,
        data: null,
        statusCode: 400,
      })
    }
  }

  for (const validate of getValidatorsForInstance<Context>(service)) {
    await doValidate(validate)
  }

  for (const validate of getValidatorsForMethod<Context>(service, method)) {
    await doValidate(validate)
  }
}

export const createRpcService = <T, M extends FunctionPropertyNames<T>>(
  service: T,
  methods?: M[],
) => {

  const rpcService = methods ? pick(service, methods) :
    pick(service, getAllMethods(service))
  return {
    async invoke<Context>(
      req: Request<M, ArgumentTypes<T[M]>>,
      context: Context,
    ): Promise<SuccessResponse<RetType<T[M]>> | null> {
      const {id, method, params} = req

      if (
        req.jsonrpc !== '2.0' ||
        typeof method !== 'string' ||
        !Array.isArray(params)
      ) {
        throw createError(ERROR_INVALID_REQUEST, {
          id,
          data: null,
          statusCode: 400,
        })
      }

      const isNotification = req.id === null || req.id === undefined

      if (
        !Object.prototype.hasOwnProperty.call(rpcService, method) ||
        typeof rpcService[method] !== 'function'
      ) {
        throw createError(ERROR_METHOD_NOT_FOUND, {
          id,
          data: null,
          statusCode: 404,
        })
      }

      await validateServiceContext(id, service, method, context)

      let retValue = (rpcService[method] as any)(context, ...params)

      if (!isPromise(retValue) && isNotification) {
        return null
      }

      retValue = await retValue
      return createSuccessResponse(req.id as any, retValue)
    },
  }
}
