import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo.dev/common'
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
    t.use('/users', ensureLoggedInApi)

    t.post('/users/password', async req => {
      await this.userService.changePassword({
        userId: req.user!.id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
      })
    })

    t.get('/users/emails/:email', async req => {
      return this.userService.findUserByEmail(req.params.email)
    })

    t.get('/users/profile', async req => {
      return (await this.userService.findOne(req.user!.id))!
    })
  }
}
