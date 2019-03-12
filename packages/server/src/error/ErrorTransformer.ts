import {TransformedError} from './TransformedError'

export class ErrorTransformer {
  constructor(
    readonly status: number,
    readonly match: RegExp | string,
  ) {}

  transform(err: Error, message: string) {
    if (!this.isMatch(err)) {
      throw err
    }
    throw new TransformedError(this.status, message, err)
  }

  protected isMatch(err: Error): boolean {
    const {match} = this
    if (match instanceof RegExp) {
      return match.test(err.message)
    }
    return match === err.message
  }
}

export const UniqueTransformer = new ErrorTransformer(400, /unique/i)
