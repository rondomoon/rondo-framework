import { Method, Routes } from '@rondo.dev/http-types'
import express from 'express'
import { TypedRequest } from './TypedRequest'

export type TypedMiddleware<
  R extends Routes,
  P extends keyof R,
  M extends Method
> = (
  req: TypedRequest<R[P][M]>,
  res: express.Response,
  next: express.NextFunction,
) => void

export type TypedHandler<
  R extends Routes,
  P extends keyof R,
  M extends Method
> = (
  req: TypedRequest<R[P][M]>,
  res: express.Response,
  next: express.NextFunction,
) => Promise<R[P][M]['response']>
