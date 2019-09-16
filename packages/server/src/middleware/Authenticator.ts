import { Authenticator as A, Passport } from 'passport'
import { Strategy as LocalStrategy } from 'passport-local'
import { Middleware } from './Middleware'
import { Handler } from './Handler'
import { AuthService } from '@rondo.dev/common'

export class Authenticator implements Middleware {

  protected readonly passport: A
  readonly handle: Handler[]

  constructor(protected readonly authService: AuthService) {
    this.passport = new Passport() as any

    this.configurePassport()
    this.configureStrategies()

    this.handle = [
      this.passport.initialize(),
      this.passport.session(),
      this.withLogInPromise,
    ]
  }

  withLogInPromise: Handler = (req, res, next) => {
    req.logInPromise = (user) => {
      return new Promise((resolve, reject) => {
        req.logIn(user, err => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    }
    next()
  }

  protected serializeUser =
    // TODO parametrize user type
    (user: any, done: (err?: Error, userId?: number) => void) => {
    done(undefined, user.id)
  }

  protected deserializeUser =
    // TODO parametrize user type
    (userId: number, done: (err?: Error, user?: any) => void) => {
    this.authService.findOne(userId)
    .then(user => done(undefined, user))
    .catch(done)
  }

  protected configurePassport() {
    this.passport.serializeUser(this.serializeUser)
    this.passport.deserializeUser(this.deserializeUser)
  }

  protected configureStrategies() {
    this.passport.use(new LocalStrategy({
      passReqToCallback: false,
      session: true,
    }, this.validateCredentials))
  }

  protected validateCredentials = (
    username: string,
    password: string,
    done: (err?: Error, user?: any) => void,
  ) => {
    this.authService.validateCredentials({ username, password })
    .then(user => done(undefined, user))
    .catch(done)
  }

  authenticate(strategy: string | string[]): Handler {
    return (req, res, next) => {
      return new Promise((resolve, reject) => {
        this.passport.authenticate(strategy, (err: Error, user, info) => {
          if (err) {
            return reject(err)
          }
          resolve(user)
        })(req, res, next)
      })
    }
  }

}
