import {Asyncified, Reduxed} from '@rondo/jsonrpc-common'
import {createRemoteClient} from './remote'

export function createReduxClient<T, ActionType extends string>(
  client: Asyncified<T>,
  type: ActionType,
) {
  const service = Object.keys(client).reduce((obj, method: any) => {
    obj[method] = function makeAction(...args: any[]) {
      const payload = ((client as any)[method])(...args)
      return {
        payload,
        type,
        method,
        status: 'pending',
      }
    }
    return obj
  }, {} as any)

  return service as Reduxed<T, ActionType>
}
