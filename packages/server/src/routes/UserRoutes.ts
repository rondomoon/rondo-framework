import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo.dev/common'
import {IAuthService} from '../services'
import {ensureLoggedInApi} from '../middleware'

export class UserRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly userService: IAuthService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {
    t.use('/users', ensureLoggedInApi)

    t.get('/users/emails/:email', async req => {
      return this.userService.findUserByEmail(req.params.email)
    })

    t.get('/users/profile', async req => {
      return (await this.userService.findOne(req.user!.id))!
    })
  }
}
