export function isPromise(value: any): value is Promise<unknown> {
  return value !== null && typeof value === 'object' &&
    'then' in value && 'catch' in value &&
    typeof value.then === 'function' && typeof value.catch === 'function'
}
