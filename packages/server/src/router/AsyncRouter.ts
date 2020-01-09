import { Method, Routes } from '@rondo.dev/http-types'
import express from 'express'
import { TypedHandler, TypedMiddleware } from './TypedHandler'

export class AsyncRouter<R extends Routes> {
  readonly router: express.Router
  readonly use: express.IRouterHandler<void> & express.IRouterMatcher<void>

  constructor(router?: express.Application | express.Router) {
    this.router = router ? router : express.Router()
    this.use = this.router.use.bind(this.router) as any
  }

  protected addRoute<M extends Method, P extends keyof R & string>(
    method: M,
    path: P,
    ...handlers: [TypedHandler<R, P, M>] | [
      Array<TypedMiddleware<R, P, M>>,
      TypedHandler<R, P, M>,
    ]
  ) {
    if (handlers.length === 2) {
      const middleware = handlers[0]
      const handler = handlers[1]
      this.router[method](path, ...middleware, this.wrapHandler(handler))
    } else {
      this.router[method](path, this.wrapHandler(handlers[0]))
    }

  }

  protected wrapHandler<M extends Method, P extends keyof R & string>(
    handler: TypedHandler<R, P, M>,
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
    ...handlers: [TypedHandler<R, P, 'get'>] | [
      Array<TypedMiddleware<R, P, 'get'>>,
      TypedHandler<R, P, 'get'>,
    ]
  ): void {
    this.addRoute('get', path, ...handlers)
  }

  post<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'post'>] | [
      Array<TypedMiddleware<R, P, 'post'>>,
      TypedHandler<R, P, 'post'>,
    ]
  ) {
    this.addRoute('post', path, ...handlers)
  }

  put<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'put'>] | [
      Array<TypedMiddleware<R, P, 'put'>>,
      TypedHandler<R, P, 'put'>,
    ]
  ) {
    this.addRoute('put', path, ...handlers)
  }

  delete<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'delete'>] | [
      Array<TypedMiddleware<R, P, 'delete'>>,
      TypedHandler<R, P, 'delete'>,
    ]
  ) {
    this.addRoute('delete', path, ...handlers)
  }

  head<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'head'>] | [
      Array<TypedMiddleware<R, P, 'head'>>,
      TypedHandler<R, P, 'head'>,
    ]
  ) {
    this.addRoute('head', path, ...handlers)
  }

  options<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'options'>] | [
      Array<TypedMiddleware<R, P, 'options'>>,
      TypedHandler<R, P, 'options'>,
    ]
  ) {
    this.addRoute('options', path, ...handlers)
  }

  patch<P extends keyof R & string>(
    path: P,
    ...handlers: [TypedHandler<R, P, 'patch'>] | [
      Array<TypedMiddleware<R, P, 'patch'>>,
      TypedHandler<R, P, 'patch'>,
    ]
  ) {
    this.addRoute('patch', path, ...handlers)
  }

}
