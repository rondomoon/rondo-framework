import { IUserService } from '@rondo.dev/common'
import { compare, hash } from 'bcrypt'
import createError from 'http-errors'
import { IDatabase } from '../database/IDatabase'
import { User } from '../entities/User'
import { UserEmail } from '../entities/UserEmail'
import { ensureLoggedIn, IContext, RPC } from './RPC'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 10

@ensureLoggedIn
export class UserService implements RPC<IUserService> {
  constructor(protected readonly db: IDatabase) {}

  async getProfile(context: IContext) {
    const userId = context.user!.id

    // current user should always exist in the database
    const user = (await this.db.getRepository(User).findOne(userId, {
      relations: ['emails'],
    }))!

    return {
      id: user.id,
      username: user.emails[0] ? user.emails[0].email : '',
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async findUserByEmail(context: IContext, email: string) {
    const userEmail = await this.db.getRepository(UserEmail)
    .findOne({ email }, {
      relations: ['user'],
    })

    if (!userEmail) {
      return
    }

    const user = userEmail.user!

    return {
      id: userEmail.userId!,
      username: userEmail.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  protected async _hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
