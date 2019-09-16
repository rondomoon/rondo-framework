import {Handler} from './Handler'
import {ErrorHandler} from './ErrorHandler'

export interface Middleware {
  handle: Handler | Handler[] | ErrorHandler
}
