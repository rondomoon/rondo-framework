import Csurf from 'csurf'
import {IHandler} from './IHandler'
import {IMiddleware} from './IMiddleware'
import {UrlWithStringQuery} from 'url'

export interface ICSRFParams {
  baseUrl: UrlWithStringQuery
  cookieName: string
}

export class CSRFMiddleware implements IMiddleware {
  readonly handle: IHandler

  constructor(readonly params: ICSRFParams) {
    this.handle = Csurf({
      cookie: {
        signed: true,
        httpOnly: true,
        sameSite: true,
        secure: params.baseUrl.protocol === 'https',
        path: params.baseUrl.path,
        key: params.cookieName,
      },
    })
  }
}
