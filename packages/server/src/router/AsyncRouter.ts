import express from 'express'
import {IRoutes, TMethod} from '@rondo/common'
import {TTypedHandler, TTypedMiddleware} from './TTypedHandler'

export class AsyncRouter<R extends IRoutes> {
  readonly router: express.Router
  readonly use: express.IRouterHandler<void> & express.IRouterMatcher<void>

  constructor(router?: express.Application | express.Router) {
    this.router = router ? router : express.Router()
    this.use = this.router.use.bind(this.router) as any
  }

  protected addRoute<M extends TMethod, P extends keyof R & string>(
    method: M,
    path: P,
    ...handlers: [TTypedHandler<R, P, M>] | [
      Array<TTypedMiddleware<R, P, M>>,
      TTypedHandler<R, P, M>,
    ]
  ) {
    const addRoute = this.router[method].bind(this.router as any)

    if (handlers.length === 2) {
      const middleware = handlers[0]
      const handler = handlers[1]
      addRoute(path, ...middleware, this.wrapHandler(handler))
    } else {
      addRoute(path, this.wrapHandler(handlers[0]))
    }

  }

  protected wrapHandler<M extends TMethod, P extends keyof R & string>(
    handler: TTypedHandler<R, P, M>,
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
    ...handlers: [TTypedHandler<R, P, 'get'>] | [
      Array<TTypedMiddleware<R, P, 'get'>>,
      TTypedHandler<R, P, 'get'>,
    ]
  ): void {
    this.addRoute('get', path, ...handlers)
  }

  post<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'post'>] | [
      Array<TTypedMiddleware<R, P, 'post'>>,
      TTypedHandler<R, P, 'post'>,
    ]
  ) {
    this.addRoute('post', path, ...handlers)
  }

  put<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'put'>] | [
      Array<TTypedMiddleware<R, P, 'put'>>,
      TTypedHandler<R, P, 'put'>,
    ]
  ) {
    this.addRoute('put', path, ...handlers)
  }

  delete<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'delete'>] | [
      Array<TTypedMiddleware<R, P, 'delete'>>,
      TTypedHandler<R, P, 'delete'>,
    ]
  ) {
    this.addRoute('delete', path, ...handlers)
  }

  head<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'head'>] | [
      Array<TTypedMiddleware<R, P, 'head'>>,
      TTypedHandler<R, P, 'head'>,
    ]
  ) {
    this.addRoute('head', path, ...handlers)
  }

  options<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'options'>] | [
      Array<TTypedMiddleware<R, P, 'options'>>,
      TTypedHandler<R, P, 'options'>,
    ]
  ) {
    this.addRoute('options', path, ...handlers)
  }

  patch<P extends keyof R & string>(
    path: P,
    ...handlers: [TTypedHandler<R, P, 'patch'>] | [
      Array<TTypedMiddleware<R, P, 'patch'>>,
      TTypedHandler<R, P, 'patch'>,
    ]
  ) {
    this.addRoute('patch', path, ...handlers)
  }

}
