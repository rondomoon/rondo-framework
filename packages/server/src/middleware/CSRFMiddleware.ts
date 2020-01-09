import Csurf from 'csurf'
import { UrlWithStringQuery } from 'url'
import { Middleware } from './Middleware'
import { Handler } from './Handler'

export interface CSRFMiddlewareParams {
  baseUrl: UrlWithStringQuery
  cookieName: string
}

export class CSRFMiddleware implements Middleware {
  readonly handle: Handler

  constructor(readonly params: CSRFMiddlewareParams) {
    this.handle = Csurf({
      cookie: {
        signed: true,
        httpOnly: true,
        sameSite: true,
        secure: params.baseUrl.protocol === 'https',
        path: params.baseUrl.path !== null ? params.baseUrl.path : undefined,
        key: params.cookieName,
      },
    })
  }
}
