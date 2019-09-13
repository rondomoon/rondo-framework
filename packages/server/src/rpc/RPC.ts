import { IContext } from '@rondo.dev/common'
import { WithContext, ensure } from '@rondo.dev/jsonrpc'

export { IContext }
export type RPC<Service> = WithContext<Service, IContext>

export const ensureLoggedIn = ensure<IContext>(
  c => !!c.user && !!c.user.id,
  'You must be logged in to perform this action',
)
