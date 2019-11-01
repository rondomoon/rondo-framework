import { APIDef, AuthService } from '@rondo.dev/common'
import { Authenticator, ensureLoggedInApi } from '../middleware'
import { AsyncRouter } from '../router'

export function configureAuthRoutes(
  authService: AuthService,
  authenticator: Authenticator,
  t: AsyncRouter<APIDef>,
) {
  t.post('/auth/register', async (req, res) => {
    const user = await authService.createUser({
      username: req.body.username,
      password: req.body.password,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
    })
    await req.logInPromise(user)
    return user
  })

  t.post('/auth/login', async (req, res, next) => {
    const user = await authenticator
    .authenticate('local')(req, res, next)

    if (!user) {
      res.status(401)
      return
    }
    await req.logInPromise(user)
    // TODO regenerate session - prevent session hijacking
    //
    // Something like:
    //     var temp = req.session.passport; // {user: 1}
    //     req.session.regenerate(function(err){
    //         //req.session.passport is now undefined
    //         req.session.passport = temp;
    //         req.session.save(function(err){
    //             res.send(200);
    //         });
    //     });
    return user
  })

  t.post('/auth/password', [ensureLoggedInApi], async req => {
    await authService.changePassword({
      userId: req.user!.id,
      oldPassword: req.body.oldPassword,
      newPassword: req.body.newPassword,
    })
  })

  t.get('/auth/logout', async (req, res) => {
    req.logout()
  })

  return t.router
}
