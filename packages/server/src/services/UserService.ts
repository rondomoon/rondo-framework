import createError from 'http-errors'
import {BaseService} from './BaseService'
import {ICredentials} from '@rondo/common'
import {IUserService} from './IUserService'
import {UserEmail} from '../entities/UserEmail'
import {User} from '../entities/User'
import {compare, hash} from 'bcrypt'
import {validate as validateEmail} from 'email-validator'

const SALT_ROUNDS = 10
const MIN_PASSWORD_LENGTH = 10

export class UserService extends BaseService implements IUserService {
  async createUser(payload: ICredentials): Promise<User> {
    const username = payload.username
    if (!validateEmail(username)) {
      throw createError(400, 'Username is not a valid e-mail')
    }
    if (payload.password.length < MIN_PASSWORD_LENGTH) {
      throw createError(400,
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters long`)
    }
    const password = await this.hash(payload.password)
    const user = await this.getRepository(User).save({
      password,
    })
    await this.getRepository(UserEmail).save({
      email: username,
      userId: user.id,
    })
    return user
  }

  async findOne(id: number) {
    return this.getRepository(User).findOne(id)
  }

  async findUserByEmail(email: string) {
    const userEmail = await this.getRepository(UserEmail)
    .findOne({ email }, {
      relations: ['user'],
    })
    return userEmail && userEmail.user
  }

  async changePassword(params: {
    userId: number,
    oldPassword: string,
    newPassword: string,
  }) {
    const {userId, oldPassword, newPassword} = params
    const userRepository = this.getRepository(User)
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

  async validateCredentials(credentials: ICredentials) {
    const {username, password} = credentials
    const user = await this.getRepository(User)
    .createQueryBuilder('user')
    .select('user')
    .addSelect('user.password')
    .innerJoin('user.emails', 'emails', 'emails.email = :email', {
      email: username,
    })
    .getOne()

    const isValid = await compare(password, user ? user.password! : '')
    if (user && isValid) {
      delete user.password
      return user
    }
  }

  async findUserEmails(userId: number) {
    return this.getRepository(UserEmail).find({ userId })
  }

  protected async hash(password: string): Promise<string> {
    return hash(password, SALT_ROUNDS)
  }
}
