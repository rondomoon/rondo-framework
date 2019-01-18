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
      })
      await req.logInPromise(user)
      res.redirect(req.baseUrl)
    })

    t.post('/auth/login', async (req, res, next) => {
      const user = await this.authenticator
      .authenticate('local')(req, res, next)

      if (!user) {
        res.redirect(`${req.baseUrl}/auth/login`)
        return
      }
      await req.logInPromise(user)
      res.redirect(req.baseUrl)
    })

    t.get('/auth/logout', async (req, res) => {
      req.logout()
      res.redirect(`${req.baseUrl}/auth/login`)
    })
  }
}
