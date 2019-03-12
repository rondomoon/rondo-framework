export class TransformedError extends Error {
  constructor(
    readonly status: number,
    readonly message: string,
    readonly cause: Error,
  ) {
    super(message)
    Error.captureStackTrace(this)
    this.stack! += '\n' + cause.stack
  }
}
