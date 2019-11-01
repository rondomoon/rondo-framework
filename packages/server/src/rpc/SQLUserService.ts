import { UserService } from '@rondo.dev/common'
import { TypeORMDatabase } from '@rondo.dev/db-typeorm'
import { hash } from 'bcrypt'
import { Context, ensureLoggedIn, RPC } from './RPC'
import { UserEntity, UserEmailEntity } from '../entities'

const SALT_ROUNDS = 10
// const MIN_PASSWORD_LENGTH = 10

@ensureLoggedIn
export class SQLUserService implements RPC<UserService> {
  constructor(protected readonly db: TypeORMDatabase) {}

  async getProfile(context: Context) {
    const userId = context.user!.id

    // current user should always exist in the database
    const user = (await this.db.getRepository(UserEntity).findOne(userId, {
      relations: ['emails'],
    }))!

    return {
      id: user.id,
      username: user.emails[0] ? user.emails[0].email : '',
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async findUserByEmail(context: Context, email: string) {
    const userEmail = await this.db.getRepository(UserEmailEntity)
    .findOne({ email }, {
      relations: ['user'],
    })

    if (!userEmail) {
      return
    }

    const user = userEmail.user!

    return {
      id: userEmail.userId!,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  protected async _hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
