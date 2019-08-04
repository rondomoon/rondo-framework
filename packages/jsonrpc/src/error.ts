export interface IError {
  code: number
  message: string
}

export interface IErrorWithData<T> extends IError {
  data: T
}

export interface IErrorResponse<T> {
  jsonrpc: '2.0'
  id: string | number | null
  result: null
  error: IErrorWithData<T>
}

export interface IJSONRPCError<T> extends Error {
  code: number
  statusCode: number
  response: IErrorResponse<T>
}

export function isJSONRPCError(err: any): err is IJSONRPCError<unknown> {
  return err.name === 'IJSONRPCError' &&
    typeof err.message === 'string' &&
    err.hasOwnProperty('code') &&
    err.hasOwnProperty('response')
}

export function createError<T = null>(
  error: IError,
  info: {
    id: number | string | null
    data: T
    statusCode: number
  },
): IJSONRPCError<T> {

  const err = new Error(error.message) as IJSONRPCError<T>

  err.name = 'IJSONRPCError'
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
