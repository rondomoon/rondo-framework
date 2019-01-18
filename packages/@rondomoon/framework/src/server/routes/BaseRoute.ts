import {IHandler} from '../middleware/IHandler'
import {AsyncRouter} from '../router'
import {IAPIDef} from '../../common/IAPIDef'

export abstract class BaseRoute<T extends IAPIDef> {
  readonly handle: IHandler

  constructor(protected readonly t: AsyncRouter<T>)  {
    this.handle = t.router
    this.setup(t)
  }

  protected abstract setup(t: AsyncRouter<T>): void
}
