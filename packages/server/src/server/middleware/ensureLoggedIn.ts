import createError from 'http-errors'
import {Request} from 'express'
import {IHandler} from './IHandler'

const isLoggedIn = (req: Request) => !!(req as any).user

export const ensureLoggedInApi: IHandler = (req, res, next) => {
  if (!isLoggedIn(req)) {
    next(createError(401))
    return
  }
  next()
}

export const ensureLoggedInSite = (redirectTo: string): IHandler => {
  return function _ensureLoggedInSite(req, res, next) {
    if (!isLoggedIn(req)) {
      res.redirect(redirectTo)
      return
    }
    next()
  }
}
