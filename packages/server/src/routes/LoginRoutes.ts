import {AsyncRouter} from '../router'
import {BaseRoute} from './BaseRoute'
import {IAPIDef} from '@rondo/common'
import {IUserService} from '../services'
import {Authenticator} from '../middleware'

export class LoginRoutes extends BaseRoute<IAPIDef> {
  constructor(
    protected readonly userService: IUserService,
    protected readonly authenticator: Authenticator,
    protected readonly t: AsyncRouter<IAPIDef>,
  ) {
    super(t)
  }

  setup(t: AsyncRouter<IAPIDef>) {
    t.post('/auth/register', async (req, res) => {
      const user = await this.userService.createUser({
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

    t.get('/auth/logout', async (req, res) => {
      req.logout()
    })
  }
}
