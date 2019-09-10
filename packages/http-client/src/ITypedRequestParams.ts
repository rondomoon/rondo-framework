import {IRoutes, TMethod} from '@rondo.dev/http-types'

export interface ITypedRequestParams<
  T extends IRoutes,
  P extends keyof T & string,
  M extends TMethod,
> {
  method: M,
  path: P,
  params?: T[P][M]['params'],
  query?: T[P][M]['query'],
  body?: T[P][M]['body'],
}
