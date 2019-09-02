export interface IRequest<T> {
  id: number
  params: T
}

export interface ISuccessMessage<T> {
  id: number
  result: T
  type: 'success'
}

export interface IErrorMessage {
  id: number
  error: Error
  type: 'error'
}

export type TResponse<T> = ISuccessMessage<T> | IErrorMessage
