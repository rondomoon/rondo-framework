import {ValidationMessage} from './ValidationMessage'

export class ValidationError extends Error {
  readonly name: string
  constructor(
    readonly errors: ValidationMessage[],
    message?: string,
    readonly status: number = 400,
  ) {
    super(
      message
      ? message
      : 'Validation failed on properties: ' +
        errors.map(e => e.property).join(', '))
    this.name = 'ValidationError'
    Error.captureStackTrace(this)
  }

  static isInstanceOf(err: unknown): err is ValidationError {
    const err2 = err as ValidationError
    return err2
      && typeof err2.status === 'number'
      && typeof err2.message === 'string'
      && Array.isArray(err2.errors)
  }
}
