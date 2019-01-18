import Csurf from 'csurf'
import {IHandler} from './IHandler'

export const csrf: IHandler = Csurf({
  sessionKey: 'session',
})
