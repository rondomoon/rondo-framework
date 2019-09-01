export interface ITask<T> {
  readonly id: number
  readonly definition: T
}

export interface IResult<T> {
  readonly id: number
  readonly result: T
}
