import express from 'express'
import {IRoutes, IMethod} from '@rondo/common'
import {ITypedRequest} from './ITypedRequest'

export type ITypedHandler<
  R extends IRoutes,
  P extends keyof R,
  M extends IMethod
> = (
  req: ITypedRequest<R[P][M]>,
  res: express.Response,
  next: express.NextFunction,
) => Promise<R[P][M]['response']>
