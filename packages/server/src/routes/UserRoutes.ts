import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo/common'
import {IUserService} from '../services'
import {ensureLoggedInApi} from '../middleware'

export class UserRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly userService: IUserService,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {
    t.use(ensureLoggedInApi)

    t.post('/users/password', async req => {
      await this.userService.changePassword({
        userId: req.user!.id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
      })
    })

    t.get('/users/profile', async req => {
      return (await this.userService.findOne(req.user!.id))!
    })
  }
}
