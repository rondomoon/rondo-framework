import {Asyncified} from '@rondo/jsonrpc-common'

/**
 * Creates a local client for a specific service instance. The actual service
 * will be invoked as if it would be remotely. This helps keep the API similar
 * on the client- and server-side.
 */
export function createLocalClient<T>(service: T, context: any) {
  const proxy = new Proxy({}, {
    get(obj, prop) {
      return async function makeRequest(...args: any[]) {
        const result = (service as any)[prop](...args)
        if (typeof result === 'function') {
          return result(context)
        }
        return result
      }
    },
  })
  return proxy as Asyncified<T>
}
