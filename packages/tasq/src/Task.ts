export interface Request<T> {
  id: number
  params: T
}

export interface SuccessMessage<T> {
  id: number
  result: T
  type: 'success'
}

export interface ErrorMessage {
  id: number
  error: Error
  type: 'error'
}

export type Response<T> = SuccessMessage<T> | ErrorMessage
