import {ValidationMessage} from './ValidationMessage'
import {ValidationError} from './ValidationError'

export class Validator<T> {

  readonly errors: ValidationMessage[] = []
  readonly entity: T

  constructor(entity: T | undefined) {
    if (!entity) {
      throw new ValidationError([], 'The record could not be found')
    }
    this.entity = entity
  }

  ensure(property: keyof T, value?: unknown): this {
    if (arguments.length === 1) {
      if (!this.entity[property]) {
        this.addError(property, `The property "${property}" is invalid`)
      }
      return this
    }

    if (this.entity[property] !== value) {
      this.addError(property,
      `The property "${property}" should be equal to "${value}"` +
      ` but the actual value is "${this.entity[property]}"`)
    }
    return this
  }

  getError(): ValidationError | undefined {
    if (this.errors.length) {
      return new ValidationError(this.errors)
    }
  }

  throw() {
    const error = this.getError()
    if (error) {
      throw error
    }
  }

  protected addError(property: keyof T, message: string) {
    this.errors.push({property, message})
  }
}
