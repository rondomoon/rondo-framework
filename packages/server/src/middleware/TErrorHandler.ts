import {Request, Response, NextFunction} from 'express'

export type TErrorHandler =
  (err: Error, req: Request, res: Response, next: NextFunction) => any
