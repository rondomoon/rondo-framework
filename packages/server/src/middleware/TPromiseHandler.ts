import {Request, Response, NextFunction} from 'express'

export type TPromiseHandler<T> =
  (req: Request, res: Response, next: NextFunction) => Promise<T>
