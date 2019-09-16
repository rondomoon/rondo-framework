import { Request } from 'express'
import createError from 'http-errors'
import { Handler } from './Handler'

const isLoggedIn = (req: Request) => !!(req as any).user

export const ensureLoggedInApi: Handler = (req, res, next) => {
  if (!isLoggedIn(req)) {
    next(createError(401))
    return
  }
  next()
}

export const ensureLoggedInSite = (redirectTo: string): Handler => {
  return function _ensureLoggedInSite(req, res, next) {
    if (!isLoggedIn(req)) {
      res.redirect(redirectTo)
      return
    }
    next()
  }
}
