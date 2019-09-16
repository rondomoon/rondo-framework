import { Context } from '@rondo.dev/common'
import { WithContext, ensure } from '@rondo.dev/jsonrpc'

export { Context }
export type RPC<Service> = WithContext<Service, Context>

export const ensureLoggedIn = ensure<Context>(
  c => !!c.user && !!c.user.id,
  'You must be logged in to perform this action',
)
