import {IRoutes, IMethod} from '@rondo/common'

export interface ITypedRequestParams<
  T extends IRoutes,
  P extends keyof T & string,
  M extends IMethod,
> {
  method: M,
  path: P,
  params?: T[P][M]['params'],
  query?: T[P][M]['query'],
  body?: T[P][M]['body'],
}
