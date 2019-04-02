import express from 'express'
import {IRoutes, TMethod} from '@rondo/common'
import {ITypedRequest} from './ITypedRequest'

export type TTypedHandler<
  R extends IRoutes,
  P extends keyof R,
  M extends TMethod
> = (
  req: ITypedRequest<R[P][M]>,
  res: express.Response,
  next: express.NextFunction,
) => Promise<R[P][M]['response']>
