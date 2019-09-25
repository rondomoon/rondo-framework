import { Context } from './Context'

export const createMiddleware =
  <C extends Context = Context>(fn: (ctx: C) => unknown) => async (ctx: C) => {
    await fn(ctx)
    return undefined
  }
