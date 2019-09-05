import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo.dev/common'
import {IAuthService} from '../services'
import {Authenticator} from '../middleware'
import {ensureLoggedInApi} from '../middleware'

export class AuthRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly authService: IAuthService,
    protected readonly authenticator: Authenticator,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {
    t.post('/auth/register', async (req, res) => {
      const user = await this.authService.createUser({
        username: req.body.username,
        password: req.body.password,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
      })
      await req.logInPromise(user)
      return user
    })

    t.post('/auth/login', async (req, res, next) => {
      const user = await this.authenticator
      .authenticate('local')(req, res, next)

      if (!user) {
        res.status(401)
        return
      }
      await req.logInPromise(user)
      return user
    })

    t.post('/auth/password', [ensureLoggedInApi], async req => {
      await this.authService.changePassword({
        userId: req.user!.id,
        oldPassword: req.body.oldPassword,
        newPassword: req.body.newPassword,
      })
    })

    t.get('/auth/logout', async (req, res) => {
      req.logout()
    })
  }
}
