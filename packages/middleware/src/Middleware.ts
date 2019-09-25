import { Context } from './Context'

export type Middleware = <C extends Context>(ctx: C) => unknown
