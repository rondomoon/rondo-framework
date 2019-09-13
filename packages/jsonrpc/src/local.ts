import {RPCClient, WithContext, WithoutContext} from './types'
import {Request} from 'express'
import {TGetContext} from './express'
import {getAllMethods} from './jsonrpc'

export type LocalClient<T> = RPCClient<WithoutContext<T>>

/**
 * Creates a local client for a specific service instance. The actual service
 * will be invoked as if it would be remotely. This helps keep the API similar
 * on the client- and server-side.
 *
 * The service argument is expected to be a class implementing the
 * WithContext<Service, Context> type. The first (context) argument will be
 * automatically removed from all methods in the service, and the supplied
 * context argument will be used instead.
 */
export function createLocalClient<T extends {}, Context>(
  service: T,
  context: Context,
): LocalClient<T> {
  return getAllMethods(service)
  .filter(prop => typeof service[prop] === 'function')
  .reduce((obj, prop) => {
    obj[prop] = function makeRequest(...args: any[]) {
      return (service as any)[prop](context, ...args)
    }
    return obj
  }, {} as any)
}
