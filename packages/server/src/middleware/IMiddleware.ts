import {THandler} from './THandler'
import {TErrorHandler} from './TErrorHandler'

export interface IMiddleware {
  handle: THandler | THandler[] | TErrorHandler
}
