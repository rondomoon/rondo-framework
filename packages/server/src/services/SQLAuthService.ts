import { AuthService, Credentials, NewUser, trim, UserProfile, nullable } from '@rondo.dev/common'
import { TypeORMDatabase } from '@rondo.dev/db-typeorm'
import Validator from '@rondo.dev/validator'
import { compare, hash } from 'bcrypt'
import { validate as validateEmail } from 'email-validator'
import createError from 'http-errors'
import { UserEntity, UserEmailEntity } from '../entities'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 10

export class SQLAuthService implements AuthService {
  constructor(protected readonly db: TypeORMDatabase) {}

  async createUser(payload: NewUser): Promise<UserProfile> {
    const newUser = {
      username: trim(payload.username),
      firstName: nullable(payload.firstName),
      lastName: nullable(payload.lastName),
    }

    const email = nullable(payload.email)

    if (email && !validateEmail(email)) {
      throw createError(400, 'Username is not a valid e-mail')
    }
    if (payload.password.length < MIN_PASSWORD_LENGTH) {
      throw createError(400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    }

    new Validator(newUser)
    .ensure('username')
    .throw()

    const password = await this.hash(payload.password)
    const user = await this.db.getRepository(UserEntity).save({
      ...newUser,
      password,
    })
    if (email) {
      await this.db.getRepository(UserEmailEntity).save({
        email,
        userId: user.id,
      })
    }
    return {
      id: user.id,
      ...newUser,
    }
  }

  async findOne(id: number) {
    const user = await this.db.getRepository(UserEntity).findOne(id, {
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
      username: userEmail.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }
  }

  async changePassword(params: {
    userId: number
    oldPassword: string
    newPassword: string
  }) {
    const {userId, oldPassword, newPassword} = params
    const userRepository = this.db.getRepository(UserEntity)
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

  async validateCredentials(credentials: Credentials) {
    const {username, password} = credentials
    const user = await this.db.getRepository(UserEntity)
    .createQueryBuilder('user')
    .select('user')
    .addSelect('user.password')
    .where('user.username = :username', { username })
    .getOne()

    const isValid = await compare(password, user ? user.password! : '')
    if (user && isValid) {
      return {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
      }
    }
  }

  async findUserEmails(userId: number) {
    return this.db.getRepository(UserEmailEntity).find({ userId })
  }

  protected async hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
