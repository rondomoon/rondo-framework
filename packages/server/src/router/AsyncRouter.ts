import express from 'express'
import {IRoutes, IMethod} from '@rondo/common'
import {ITypedHandler} from './ITypedHandler'

export class AsyncRouter<R extends IRoutes> {
  readonly router: express.Router
  readonly use: express.IRouterHandler<void> & express.IRouterMatcher<void>

  constructor(router?: express.Application | express.Router) {
    this.router = router ? router : express.Router()
    this.use = this.router.use.bind(this.router) as any
  }

  protected addRoute<M extends IMethod, P extends keyof R & string>(
    method: M,
    path: P,
    handler: ITypedHandler<R, P, M>,
  ) {
    const addRoute = this.router[method].bind(this.router)

    addRoute(path, this.wrapHandler(handler))
  }

  protected wrapHandler<M extends IMethod, P extends keyof R & string>(
    handler: ITypedHandler<R, P, M>,
  ): express.RequestHandler {
    return (req, res, next) => {
      handler(req, res, next)
      .then(response => {
        res.json(response)
      })
      .catch(next)
    }
  }

  get<P extends keyof R & string>(
    path: P,
    handler: ITypedHandler<R, P, 'get'>,
  ) {
    this.addRoute('get', path, handler)
  }

  post<P extends keyof R & string>(
    path: P,
    handler: ITypedHandler<R, P, 'post'>,
  ) {
    this.addRoute('post', path, handler)
  }

  put<P extends keyof R & string>(
    path: P, handler: ITypedHandler<R, P, 'put'>,
  ) {
    this.addRoute('put', path, handler)
  }

  delete<P extends keyof R & string>(
    path: P, handler: ITypedHandler<R, P, 'delete'>) {
    this.addRoute('delete', path, handler)
  }

  head<P extends keyof R & string>(
    path: P,
    handler: ITypedHandler<R, P, 'head'>,
  ) {
    this.addRoute('head', path, handler)
  }

  options<P extends keyof R & string>(
    path: P, handler: ITypedHandler<R, P, 'options'>) {
    this.addRoute('options', path, handler)
  }

  patch<P extends keyof R & string>(
    path: P, handler: ITypedHandler<R, P, 'patch'>) {
    this.addRoute('patch', path, handler)
  }

}
