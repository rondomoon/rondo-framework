import express from 'express'
import {IRoute} from '@rondo.dev/common'

export interface ITypedRequest<T extends IRoute> extends express.Request {
  body: T['body']
  params: T['params']
  query: T['query']
}
