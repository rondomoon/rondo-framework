import {IHandler} from './IHandler'
import {IErrorHandler} from './IErrorHandler'

export interface IMiddleware {
  handle: IHandler | IHandler[] | IErrorHandler
}
