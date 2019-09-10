export async function getError(promise: Promise<unknown>) {
  let error!: Error
  try {
    await promise
  } catch (err) {
    error = err
  }
  expect(error).toBeTruthy()
  return error
}
