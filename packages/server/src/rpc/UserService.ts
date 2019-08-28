import { user as u } from '@rondo.dev/common'
import { compare, hash } from 'bcrypt'
import createError from 'http-errors'
import { IDatabase } from '../database/IDatabase'
import { User } from '../entities/User'
import { UserEmail } from '../entities/UserEmail'
import { ensureLoggedIn, IContext, RPC } from './RPC'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 10

@ensureLoggedIn
export class UserService implements RPC<u.IUserService> {
  constructor(protected readonly db: IDatabase) {}

  async changePassword(params: u.IChangePasswordParams, context: IContext) {
    const userId = context.user!.id
    const {oldPassword, newPassword} = params
    const userRepository = this.db.getRepository(User)
    const user = await userRepository
    .createQueryBuilder('user')
    .select('user')
    .addSelect('user.password')
    .whereInIds([ userId ])
    .getOne()
    const isValid = await compare(oldPassword, user ? user.password! : '')
    if (!(user && isValid)) {
      throw createError(400, 'Passwords do not match')
    }
    const password = await this.hash(newPassword)
    await userRepository
    .update(userId, { password })
  }

  async findOne(id: number) {
    const user = await this.db.getRepository(User).findOne(id, {
      relations: ['emails'],
    })

    if (!user) {
      return undefined
    }

    return {
      id: user.id,
      username: user.emails[0] ? user.emails[0].email : '',
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async findUserByEmail(email: string) {
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

  protected async hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
