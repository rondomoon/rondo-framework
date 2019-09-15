export interface Deferred<T> {
  resolve(result: T | PromiseLike<T> | undefined): void
  reject(err: Error): void
}

export class DeferredPromise<T> implements Deferred<T> {
  readonly resolve: (result: T | PromiseLike<T> | undefined) => void
  readonly reject!: (err: Error) => void
  readonly promise!: Promise<T>

  constructor() {
    let res: (result: T | PromiseLike<T> | undefined) => void
    let rej: (err: Error) => void

    this.promise = new Promise<T>((resolve, reject) => {
      res = resolve
      rej = reject
    })

    this.resolve = res!
    this.reject = rej!
  }
}
