import {Request, Response, NextFunction} from 'express'

export type ErrorHandler =
  (err: Error, req: Request, res: Response, next: NextFunction) => any
