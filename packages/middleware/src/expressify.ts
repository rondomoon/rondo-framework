import { NextFunction, Request, Response } from 'express'
import { Middleware } from './Middleware'

export const expressify = (
  handleMiddleware: Middleware,
  sendResponse: (res: Response, result: unknown) => void =
    (res, result) => res.json(result),
) => async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  let result: unknown
  try {
    result = await handleMiddleware({req, res})
  } catch (err) {
    next(err)
    return
  }
  if (result === undefined) {
    next()
    return
  }
  if (res.writable) {
    sendResponse(res, result)
  }
}
