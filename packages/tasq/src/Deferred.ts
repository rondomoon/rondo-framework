export interface IDeferred<T> {
  resolve(result: T | PromiseLike<T> | undefined): void
  reject(err: Error): void
}

export class Deferred<T> implements IDeferred<T> {
  readonly resolve: (result: T | PromiseLike<T> | undefined) => void
  readonly reject: (err: Error) => void
  readonly promise: Promise<T>

  constructor() {
    let res: any
    let rej: any

    this.promise = new Promise<T>((resolve, reject) => {
      res = resolve
      rej = reject
    })

    this.resolve = res
    this.reject = rej
  }
}
