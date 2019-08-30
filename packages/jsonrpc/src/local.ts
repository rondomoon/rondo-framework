import {TAsyncified, Contextual, ReverseContextual} from './types'
import {Request} from 'express'
import {TGetContext} from './express'

/**
 * Creates a local client for a specific service instance. The actual service
 * will be invoked as if it would be remotely. This helps keep the API similar
 * on the client- and server-side.
 */
export function createLocalClient<T, Context>(
  service: T,
  getContext: () => Context,
): TAsyncified<ReverseContextual<T>> {
  const proxy = new Proxy({}, {
    get(obj, prop) {
      const context = getContext()
      return async function makeRequest(...args: any[]) {
        const result = (service as any)[prop](context, ...args)
        return result
      }
    },
  })
  return proxy as any
}
