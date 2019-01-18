import {Request, Response, NextFunction} from 'express'

export type IPromiseHandler<T> =
  (req: Request, res: Response, next: NextFunction) => Promise<T>
