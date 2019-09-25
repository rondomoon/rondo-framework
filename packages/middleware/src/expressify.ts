import { NextFunction, Request, Response } from 'express'
import { IncomingMessage, ServerResponse } from 'http'
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
    const r: IncomingMessage = req
    const rr: ServerResponse = res
    result = await handleMiddleware({req: r, res: rr})
  } catch (err) {
    next(err)
    return
  }
  if (result === undefined) {
    next()
    return
  }
  sendResponse(res, result)
}
