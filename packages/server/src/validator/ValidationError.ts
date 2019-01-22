import {IValidationMessage} from './IValidationMessage'

export class ValidationError extends Error {
  readonly name: string
  constructor(
    readonly errors: IValidationMessage[],
    message?: string,
  ) {
    super(
      message
      ? message
      : 'Validation failed on properties: ' +
        errors.map(e => e.property).join(', '))
    this.name = 'ValidationError'
    Error.captureStackTrace(this)
  }
}