import {Request, Response, NextFunction} from 'express'

export type IErrorHandler =
  (err: Error, req: Request, res: Response, next: NextFunction) => any
