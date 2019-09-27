import { Middleware } from './Middleware'
import { Context } from './Context'

export const createMiddleware = (fn: Middleware) => async (ctx: Context) => {
    await fn(ctx)
    return undefined
  }
