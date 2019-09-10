import {THandler} from '../middleware/THandler'
import {AsyncRouter} from '../router'
import {IRoutes} from '@rondo.dev/http-types'

export abstract class BaseRoute<T extends IRoutes> {
  readonly handle: THandler

  constructor(protected readonly t: AsyncRouter<T>)  {
    this.handle = t.router
    this.setup(t)
  }

  protected abstract setup(t: AsyncRouter<T>): void
}
