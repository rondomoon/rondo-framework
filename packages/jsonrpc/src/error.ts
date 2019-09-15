export interface ErrorWithCode {
  code: number
  message: string
}

export interface ErrorWithData<T> extends ErrorWithCode {
  data: T
}

export interface ErrorResponse<T> {
  jsonrpc: '2.0'
  id: string | number | null
  result: null
  error: ErrorWithData<T>
}

export interface RPCError<T> extends Error {
  code: number
  statusCode: number
  response: ErrorResponse<T>
}

export function isRPCError(err: any): err is RPCError<unknown> {
  return err.name === 'RPCError' &&
    typeof err.message === 'string' &&
    Object.prototype.hasOwnProperty.call(err, 'code') &&
    Object.prototype.hasOwnProperty.call(err, 'response')
}

export function createError<T = null>(
  error: ErrorWithCode,
  info: {
    id: number | string | null
    data: T
    statusCode: number
  },
): RPCError<T> {

  const err = new Error(error.message) as RPCError<T>

  err.name = 'RPCError'
  err.code = error.code
  err.statusCode = info.statusCode
  err.response = {
    jsonrpc: '2.0',
    id: info.id,
    error: {
      message: error.message,
      code: error.code,
      data: info.data,
    },
    result: null,
  }

  return err
}
