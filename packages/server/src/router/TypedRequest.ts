import { Route } from '@rondo.dev/http-types'
import express from 'express'

export interface TypedRequest<T extends Route> extends express.Request {
  body: T['body']
  params: T['params']
  query: T['query']
}
