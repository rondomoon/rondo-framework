import {Routes, Method} from '@rondo.dev/http-types'

export interface TypedRequestParams<
  T extends Routes,
  P extends keyof T & string,
  M extends Method,
> {
  method: M
  path: P
  params?: T[P][M]['params']
  query?: T[P][M]['query']
  body?: T[P][M]['body']
}
