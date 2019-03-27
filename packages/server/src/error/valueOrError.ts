import createError from 'http-errors'

/**
 * Checks if the value is either null or undefined. If so, throws a Not Found
 * HTTP error. Otherwise, returns the value. The parameter `statusCode` can be
 * used to modify the error status code.
 */
export function valueOrError<T>(
  value: T | undefined | null,
  statusCode = 404,
): T {
  if (value === undefined || value === null) {
    throw createError(statusCode)
  }
  return value
}
