import { Context } from './Context'

export type Middleware = (ctx: Context) => unknown
