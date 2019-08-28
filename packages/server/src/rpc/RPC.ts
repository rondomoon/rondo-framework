import { IContext } from '@rondo.dev/common'
import { Contextual, ensure } from '@rondo.dev/jsonrpc'

export { IContext }
export type RPC<Service> = Contextual<Service, IContext>

export const ensureLoggedIn = ensure<IContext>(
  c => !!c.user && !!c.user.id,
  'You must be logged in to perform this action',
)
