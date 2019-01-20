/**
 * Waits for a promise be rejected and return the error. If a promise resolves
 * it will throw an error. To be used during testing since
 * `expect(...).toThrowError()` only works with synchronous calls
 */
export async function getError(promise: Promise<any>): Promise<Error> {
  let error: Error
  try {
    await promise
  } catch (err) {
    error = err
  }
  expect(error!).toBeTruthy()
  return error!
}
