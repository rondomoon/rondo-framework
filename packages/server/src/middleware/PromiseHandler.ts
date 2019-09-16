import { NextFunction, Request, Response } from 'express'

export type PromiseHandler<T> =
  (req: Request, res: Response, next: NextFunction) => Promise<T>
